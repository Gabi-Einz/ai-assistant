import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { makeQueryClient } from "./lib/query-client";

export function createRouter() {
  const queryClient = makeQueryClient();

  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
