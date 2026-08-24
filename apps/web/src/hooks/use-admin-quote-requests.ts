import { getListQuoteRequestsQueryKey, useListQuoteRequests } from '@workspace/api-client-react';

/** Shared, short-lived cache used by the Consultations and Calendar admin views. */
export function useAdminQuoteRequests() {
  return useListQuoteRequests({
    query: {
      queryKey: getListQuoteRequestsQueryKey(),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  });
}
