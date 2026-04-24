## ADDED Requirements

### Requirement: QueryClient is created per-request on the server and once on the client
`apps/web/app/lib/query-client.ts` SHALL export `function makeQueryClient(): QueryClient` that creates a `QueryClient` with `defaultOptions.queries.staleTime` set to at least `30_000` ms (to prevent immediate re-fetching on hydration) and `retry: false` on the server. `createRouter()` in `router.tsx` SHALL call `makeQueryClient()` and pass the result as `queryClient` in the router context.

#### Scenario: Router context exposes queryClient
- **WHEN** any route accesses `Route.useRouteContext()`
- **THEN** it receives a `queryClient` typed as `QueryClient`

#### Scenario: Server creates a fresh QueryClient per request
- **WHEN** `createRouter()` is called on the server for each incoming request
- **THEN** a new `QueryClient` instance is created, isolating query cache between requests

### Requirement: __root.tsx wraps the tree with QueryClientProvider
`apps/web/app/routes/__root.tsx` SHALL use `createRootRouteWithContext<{ queryClient: QueryClient }>()` and its component SHALL render `<QueryClientProvider client={queryClient}>` around `<Outlet />`. It SHALL also render `<DehydratedState />` or equivalent to pass the dehydrated query cache to the client.

#### Scenario: QueryClient is available via useQueryClient() in any route component
- **WHEN** a child route component calls `useQueryClient()`
- **THEN** it receives the same `QueryClient` instance that was created in `createRouter()`

#### Scenario: SSR-fetched data is hydrated without a loading flash
- **WHEN** a route pre-fetches data in a server loader and the page is rendered in the browser
- **THEN** the hydrated query cache is immediately available and no loading state is shown for pre-fetched queries
