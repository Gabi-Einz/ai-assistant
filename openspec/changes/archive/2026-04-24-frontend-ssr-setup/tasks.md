## 1. Dependencies

- [x] 1.1 Add `@tanstack/react-query`, `@trpc/client`, `@trpc/react-query`, `better-auth` to `apps/web/package.json` dependencies; add `@repo/api` as a devDependency; run `pnpm install`
- [x] 1.2 Add `"main": "./src/index.ts", "types": "./src/infrastructure/trpc/router.ts"` to `apps/api/package.json` so TypeScript in `apps/web` can resolve `AppRouter` via `import type { AppRouter } from '@repo/api'`

## 2. Lib Files

- [x] 2.1 Create `apps/web/app/lib/query-client.ts` exporting `makeQueryClient()` — returns `new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })`
- [x] 2.2 Create `apps/web/app/lib/trpc.ts` exporting `trpc = createTRPCReact<AppRouter>()` and `trpcClient = createTRPCClient<AppRouter>({ links: [httpBatchLink({ url: \`${import.meta.env.VITE_API_URL}/trpc\` })] })`
- [x] 2.3 Create `apps/web/app/lib/auth-client.ts` exporting `authClient = createAuthClient({ baseURL: import.meta.env.VITE_API_URL })`

## 3. Router & Root Route

- [x] 3.1 Update `apps/web/app/router.tsx` — import `makeQueryClient`, call it inside `createRouter()`, pass `{ queryClient }` as the router `context` option; update the `Register` module augmentation to include `context: { queryClient: QueryClient }`
- [x] 3.2 Update `apps/web/app/routes/__root.tsx` — use `createRootRouteWithContext<{ queryClient: QueryClient }>()`, read `queryClient` from `Route.useRouteContext()`, wrap `<Outlet />` with `<QueryClientProvider>` and `<trpc.Provider client={trpcClient} queryClient={queryClient}>`; add `<DehydratedState />` for SSR hydration

## 4. Type Check

- [x] 4.1 Run `cd apps/web && pnpm exec tsc --noEmit` and confirm zero type errors
