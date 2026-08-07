import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Don't retry on auth errors — fail fast and show the error
        retry: (failureCount, error) => {
          const msg = (error as Error)?.message ?? "";
          if (msg.includes("401") || msg.includes("403") || msg.includes("Forbidden") || msg.includes("Unauthorized")) {
            return false;
          }
          return failureCount < 2;
        },
        staleTime: 30_000, // 30 seconds
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
