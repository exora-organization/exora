"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,     // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000,       // Garbage collection cache time of 10 minutes
        refetchOnWindowFocus: false,  // Disable automatic refetching on browser window refocusing
        refetchOnReconnect: false,    // Disable automatic refetching on network reconnect
        retry: 1,                     // Retry once on failure to speed up error states
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
