## ADDED Requirements

### Requirement: trpc.ts exports typed React Query hooks and a vanilla tRPC client
`apps/web/app/lib/trpc.ts` SHALL export `trpc` (created with `createTRPCReact<AppRouter>()`) and `trpcClient` (created with `createTRPCClient<AppRouter>` using `httpBatchLink` pointing to `${import.meta.env.VITE_API_URL}/trpc`). The `AppRouter` type SHALL be imported as a type-only import from `@repo/api`.

#### Scenario: tRPC hooks are typed against the backend router
- **WHEN** a component calls `trpc.chat.list.useQuery(...)`
- **THEN** TypeScript provides the correct input and output types from `AppRouter`

#### Scenario: tRPC requests go to VITE_API_URL/trpc
- **WHEN** any tRPC hook fires a request
- **THEN** the HTTP request targets `${VITE_API_URL}/trpc/<procedure-path>`

### Requirement: __root.tsx wraps the tree with trpc.Provider
`apps/web/app/routes/__root.tsx` SHALL render `<trpc.Provider client={trpcClient} queryClient={queryClient}>` wrapping the component tree so all child routes can use tRPC hooks.

#### Scenario: tRPC hooks work inside any route component
- **WHEN** a route component calls any `trpc.*` hook
- **THEN** the hook resolves without "No tRPC Provider found" error

### Requirement: apps/api exposes AppRouter type for web consumption
`apps/api/package.json` SHALL include an export or `types` entry pointing to the tRPC router file so TypeScript in `apps/web` can resolve `import type { AppRouter } from '@repo/api'`.

#### Scenario: TypeScript resolves AppRouter from @repo/api
- **WHEN** `apps/web/app/lib/trpc.ts` uses `import type { AppRouter } from '@repo/api'`
- **THEN** `tsc --noEmit` in `apps/web` succeeds with no module-not-found error
