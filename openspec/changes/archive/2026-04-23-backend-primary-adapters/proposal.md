## Why

The domain, application, and infrastructure secondary adapters are complete but there is no HTTP entry point — nothing wires the use cases to the outside world. This step creates the primary adapter layer: the Hono app factory, tRPC routers, BetterAuth server setup, and the auth middleware that extracts `userId` from the session, making the API callable from the frontend.

## What Changes

- Add `infrastructure/http/app.ts` — Hono app factory that mounts the tRPC handler and BetterAuth's catch-all route, returning a configured `Hono` instance
- Add `infrastructure/auth/better-auth.adapter.ts` — BetterAuth server instance configured with MongoDB adapter, secret from env, and email/password plugin
- Add `infrastructure/trpc/router.ts` — root tRPC router merging `chat` and `message` sub-routers; exports `AppRouter` type for frontend
- Add `infrastructure/trpc/middleware/auth.middleware.ts` — tRPC middleware that reads the BetterAuth session from the request cookie and injects `userId: string` into context; throws `UNAUTHORIZED` if no valid session
- Add `infrastructure/trpc/routers/chat.router.ts` — 6 procedures behind auth middleware: `create`, `list`, `search`, `rename`, `togglePin`, `delete`
- Add `infrastructure/trpc/routers/message.router.ts` — `list` procedure (query) behind auth middleware; streaming `send` is deferred to step 8 (SSE endpoint)
- Update `apps/api/src/index.ts` to call `initContainer`, then `createApp`, and serve with Bun

## Capabilities

### New Capabilities
- `hono-app-factory`: Hono HTTP app that mounts tRPC and BetterAuth routes, accepts a `Container` to produce the tRPC context
- `betterauth-server`: BetterAuth server adapter with MongoDB, email/password plugin, and env-configured secret
- `trpc-root-router`: Root tRPC router, `AppRouter` type export, and `createCaller` factory for server-side use
- `trpc-auth-middleware`: Per-request tRPC middleware that validates BetterAuth session and surfaces `userId` as a non-null string
- `trpc-chat-router`: tRPC procedures for all 6 chat use cases (create, list, search, rename, togglePin, delete) with Zod-validated inputs
- `trpc-message-router`: tRPC `list` procedure for listing messages by chatId

### Modified Capabilities
<!-- none — no existing spec-level behavior changes -->

## Impact

- `apps/api/src/index.ts` — updated to boot the full app (db → container → Hono)
- `apps/api/package.json` — new dependency: `better-auth` + `@better-auth/mongodb-adapter` (or the built-in mongo adapter)
- Frontend (future step) — consumes `AppRouter` type from `apps/api` for end-to-end type safety
