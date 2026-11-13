import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/core/http/api-error";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      retry: (tentativas, erro) =>
        !(erro instanceof ApiError && erro.isClientError) && tentativas < 2,
    },
    mutations: { retry: false },
  },
});
