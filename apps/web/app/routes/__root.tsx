import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import {
  dehydrate,
  HydrationBoundary,
  QueryClientProvider,
  type QueryClient,
} from "@tanstack/react-query";
import { RouterProvider } from "@heroui/react";
import { trpc, trpcClient } from "~/lib/trpc";
import tailwindUrl from "~/tailwind.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-foreground text-lg">404 — Page not found</p>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      links: [{ rel: "stylesheet", href: tailwindUrl }],
    }),
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
  },
);

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AI Assistant</title>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <RouterProvider
          navigate={(to) => router.navigate({ to: to as any })}
          useHref={(to) => router.buildLocation({ to: to as any }).href}
        >
          <QueryClientProvider client={queryClient}>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
              <HydrationBoundary state={dehydrate(queryClient)}>
                <Outlet />
              </HydrationBoundary>
            </trpc.Provider>
          </QueryClientProvider>
        </RouterProvider>
        <Scripts />
      </body>
    </html>
  );
}
