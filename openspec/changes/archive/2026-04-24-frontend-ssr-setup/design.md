## Context

TanStack Start (Vinxi + Vite SSR) renders routes on the server and hydrates them in the browser. TanStack Router's `createRouter` accepts a `context` object that is available to all routes — this is the idiomatic place to carry the `QueryClient`. The existing `router.tsx` and `__root.tsx` are minimal stubs from the monorepo bootstrap.

`apps/api` exports `AppRouter` from `infrastructure/trpc/router.ts`. The web app needs this type for end-to-end type safety without shipping any API runtime code.

## Goals / Non-Goals

**Goals:**
- `QueryClient` created once per request on the server, once on the client — passed via router context
- tRPC React Query hooks typed against `AppRouter`; `trpcClient` points to `VITE_API_URL/trpc`
- BetterAuth browser client exported as a singleton from `app/lib/auth-client.ts`
- `__root.tsx` wraps the tree with `QueryClientProvider` + `trpc.Provider`

**Non-Goals:**
- Route-level data fetching — that happens in steps 11–13
- Suspense boundaries / error boundaries — added per-route as needed
- React Query devtools — not needed for the challenge

## Decisions

### QueryClient in router context (not React context directly)
TanStack Router's context is the canonical SSR-safe way to pass per-request data. Creating `queryClient` inside `createRouter()` means a fresh instance per server request (no cross-request state leak) while the browser creates it once.

**Alternative**: global singleton `queryClient`. Rejected — leaks state between SSR requests in Node/Bun server environments.

### `@repo/api` as dev dependency for AppRouter type
The web bundle must never include server code from `apps/api`. A dev-only workspace dependency gives TypeScript access to `AppRouter` at compile time; the import in `trpc.ts` is `import type { AppRouter }`, ensuring zero runtime inclusion.

**Alternative**: re-export `AppRouter` from `@repo/shared`. Rejected — shared packages shouldn't depend on app-layer types; it inverts the dependency direction.

### `@trpc/react-query` for tRPC hooks
`@trpc/react-query` wraps `@tanstack/react-query` and generates typed hooks (`trpc.chat.list.useQuery()` etc.) from the router type. This is the standard integration used across the tRPC ecosystem.

### One tRPC client instance, shared via Provider
`trpcClient` (the vanilla `@trpc/client`) is created once and passed to `trpc.Provider`. Queries created via hooks inside the provider automatically use this client + the shared `QueryClient`. No per-component client creation.

### BetterAuth client as module singleton
`auth-client.ts` exports a pre-constructed `authClient` using `createAuthClient`. Since it is browser-only (reads cookies, calls `/api/auth/*`), it is safe as a module-level singleton. Routes import it directly — no React context needed.

### SSR hydration
TanStack Start handles dehydration automatically when `QueryClient` is in the router context and `dehydrate`/`HydrationBoundary` are wired in `__root.tsx`. The server serialises the query cache; the client rehydrates it before first paint — no loading flicker for pre-fetched data.

## Risks / Trade-offs

- **`VITE_API_URL` must be set**: The tRPC client and auth client both need this at runtime. If not set, requests will go to `undefined/trpc` and fail with a network error. Mitigated by the `.env.example` entry added in step 9.
- **`@repo/api` package.json needs a `types` or `exports` field**: Without a proper `types` entry in `apps/api/package.json`, TypeScript may not resolve `AppRouter`. We need to ensure the api package exposes its types correctly (add `"types": "./src/infrastructure/trpc/router.ts"` or similar export map entry).
