"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { AppThemeProvider } from "@/lib/theme";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60, retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

