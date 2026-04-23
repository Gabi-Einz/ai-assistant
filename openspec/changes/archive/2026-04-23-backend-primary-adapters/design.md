## Context

Secondary adapters (repositories, AI provider, tools) and the DI composition root (`container.ts`) are in place. `AppContext` already declares `userId: string | null` and spreads use case instances — it was designed to be populated in this step. The Hono app entry point (`index.ts`) currently bootstraps MongoDB but does nothing with the container. This step closes the gap by wiring the HTTP layer.

BetterAuth manages sessions; its Node/Bun adapter reads a cookie and returns a typed session object. The frontend will import `AppRouter` from `apps/api` for end-to-end type safety via tRPC.

## Goals / Non-Goals

**Goals:**
- Hono app factory that mounts tRPC and BetterAuth, configurable with a `Container`
- BetterAuth server instance with MongoDB adapter, email/password plugin, env-backed secret
- Root tRPC router exporting `AppRouter` type
- Auth middleware that validates BetterAuth session and surfaces `userId` as `string`
- Chat router: all 6 CRUD procedures (create, list, search, rename, togglePin, delete), all auth-protected
- Message router: `list` query (auth-protected); `send` is excluded — covered by step 8 (SSE)
- Updated `index.ts` wiring: db → container → app → `Bun.serve`

**Non-Goals:**
- SSE streaming endpoint for `sendMessage` — that is step 8
- Frontend tRPC client configuration — that is a frontend step
- Environment variable validation schema — step 9

## Decisions

### BetterAuth — MongoDB adapter approach
BetterAuth ships a built-in `mongodbAdapter` that accepts a `MongoClient`. It manages `users` and `sessions` collections natively. Using the built-in adapter avoids a separate `@better-auth/mongodb-adapter` package. The `MongoClient` (not `Db`) is passed to the adapter — keep a reference to the client in `connectDb()` or pass it separately via `initContainer`.

**Chosen**: export both `client` and `db` from `connectDb()`; pass `client` to BetterAuth adapter and `db` to repositories. This avoids passing `MongoClient` into the DI container while keeping BetterAuth wired at the app level.

### tRPC initialization
Use `initTRPC.context<AppContext>().create()`. Define three building blocks:
- `t.router` — for composing sub-routers
- `t.procedure` — the base unauthenticated procedure
- `authedProcedure` — `t.procedure.use(authMiddleware)` where the middleware asserts `ctx.userId !== null` and rethrows as `TRPCError({ code: 'UNAUTHORIZED' })`

All chat and message procedures use `authedProcedure`.

### Auth middleware — session extraction
Inside the tRPC `context.ts`, `userId` is `null` (set in step 6). The auth middleware reads the BetterAuth session by calling `auth.api.getSession({ headers: ctx.req.headers })`. If no session or session expired, throw `TRPCError({ code: 'UNAUTHORIZED' })`. Otherwise, overwrite `ctx.userId` with `session.user.id`.

The `betterAuthAdapter` instance is created once in `better-auth.adapter.ts` and imported by both the Hono app (for the catch-all handler) and the tRPC auth middleware (for `getSession`).

### Mounting tRPC in Hono
Use `@trpc/server/adapters/fetch` `fetchRequestHandler`. Register it on `app.all('/trpc/*', ...)`. Pass `createContextFactory(container)` as the `createContext` option. This keeps Hono as the outer shell and tRPC purely as a request handler.

### BetterAuth in Hono
Register `app.all('/api/auth/*', (c) => auth.handler(c.req.raw))`. BetterAuth handles all sub-paths (`/sign-in`, `/sign-up`, `/sign-out`, session management) via its own router internally.

### Zod input validation
Every tRPC procedure validates its input with a Zod schema inline (`.input(z.object({...}))`). No shared schema files for tRPC inputs in this step — the schemas are simple enough to define inline. `chat.router.ts` uses `z.string()` for IDs and titles; `message.router.ts` uses `z.string()` for `chatId`.

### `index.ts` boot sequence
```
connectDb() → { client, db }
initContainer(db) → Container
createBetterAuth(client) → auth (re-used in createApp)
createApp({ container, auth }) → Hono
Bun.serve({ fetch: app.fetch, port })
```

The `auth` instance is not part of `Container` — it lives at the HTTP layer, created once and passed to `createApp`. Container stays pure (use cases only).

## Risks / Trade-offs

- **BetterAuth version lock**: The `mongodbAdapter` API surface is internal and may change across minor BetterAuth versions. Mitigation: pin the BetterAuth version in `package.json`; wrap the adapter creation in `better-auth.adapter.ts` so only one file changes on upgrade.

- **Auth middleware re-validates session per request**: Every tRPC call to an authed procedure calls `auth.api.getSession()`, which hits MongoDB. For this challenge scale this is fine; in production a short-lived JWT or Redis-backed session would reduce latency.

- **`AppRouter` type import on the frontend**: The frontend must import `type AppRouter` from `apps/api`. This creates a dev-time dependency between workspaces. Turborepo's `build` pipeline handles this; it will not be a runtime bundle issue.

## Open Questions

- None — BetterAuth's Bun/fetch adapter is confirmed to work with Hono via `handler(rawRequest)`.
