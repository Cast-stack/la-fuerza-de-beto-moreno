import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Every framework-emitted <script>/<style> gets this placeholder nonce.
    // The Worker (server.ts) swaps it for a fresh random nonce per request
    // and sets the matching CSP header, so we can drop script-src
    // 'unsafe-inline'. Keep this literal in sync with NONCE_SENTINEL there.
    ssr: { nonce: "__CSP_NONCE__" },
  });

  return router;
};
