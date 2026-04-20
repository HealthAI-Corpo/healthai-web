"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { AppThemeProvider } from "@/lib/theme";

const TOKEN_KEY = "healthai_jwt";

// Synchronise l'access_token ZITADEL (session next-auth) dans localStorage
// pour que nestFetch() / getAuthHeaders() puisse le lire sans être un hook.
function TokenSync() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.accessToken) {
      localStorage.setItem(TOKEN_KEY, session.accessToken);
    } else if (session === null) {
      // session=null signifie déconnecté (pas en cours de chargement)
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [session?.accessToken, session]);
  return null;
}

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
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TokenSync />
        <AppThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
