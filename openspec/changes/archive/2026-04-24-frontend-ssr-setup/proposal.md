## Why

The web app is a bare TanStack Start scaffold — no data-fetching client, no auth client, no SSR hydration wiring. Steps 11–13 all depend on a `QueryClient`, a tRPC client, and a BetterAuth client being available through the router context. This step installs that infrastructure so route-level code can focus on features, not plumbing.

## What Changes

- Install `@tanstack/react-query`, `@trpc/client`, `@trpc/react-query` in `apps/web`
- Add `@repo/api` as a dev dependency to `apps/web` to get the `AppRouter` type (no runtime bundle impact — type import only)
- Create `apps/web/app/lib/query-client.ts` — factory that creates a `QueryClient` with sensible SSR defaults (no retries on server, 30s stale time)
- Create `apps/web/app/lib/trpc.ts` — `createTRPCReact<AppRouter>()` hook set + `trpcClient` pointing to `VITE_API_URL/trpc`
- Create `apps/web/app/lib/auth-client.ts` — BetterAuth client via `createAuthClient({ baseURL: VITE_API_URL })`
- Update `apps/web/app/router.tsx` — pass `queryClient` in router context
- Update `apps/web/app/routes/__root.tsx` — wrap tree with `QueryClientProvider` and `TRPCProvider`; handle SSR dehydration/hydration
- Update `apps/web/app/ssr.tsx` to attach the router's `QueryClient` for SSR dehydration if needed

## Capabilities

### New Capabilities
- `frontend-query-client`: TanStack Query client configured for SSR — dehydrated on server, hydrated on client via router context
- `frontend-trpc-client`: tRPC React Query hooks wired to the backend `AppRouter`
- `frontend-auth-client`: BetterAuth browser client for session reads and auth actions

### Modified Capabilities
<!-- none -->

## Impact

- `apps/web/package.json` — new dependencies: `@tanstack/react-query`, `@trpc/client`, `@trpc/react-query`; new dev dep: `@repo/api`
- `apps/web/app/router.tsx` — updated to pass `queryClient` in context
- `apps/web/app/routes/__root.tsx` — updated to mount providers
- `apps/web/app/lib/` — 3 new files
