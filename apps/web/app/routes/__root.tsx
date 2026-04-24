import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import {
  dehydrate,
  HydrationBoundary,
  QueryClientProvider,
  type QueryClient,
} from "@tanstack/react-query";
import { trpc, trpcClient } from "~/lib/trpc";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
  },
);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AI Assistant</title>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <Outlet />
            </HydrationBoundary>
          </trpc.Provider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
