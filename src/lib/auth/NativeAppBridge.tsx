"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isMobileAppTarget } from "@/lib/runtime";

function mapIncomingUrlToRoute(url: string): string | null {
  try {
    const parsed = new URL(url);
    const isAuthCallback =
      (parsed.host === "auth" && parsed.pathname === "/callback") ||
      parsed.pathname === "/auth/callback" ||
      parsed.pathname === "/mobile-auth/callback";

    if (!isAuthCallback) return null;

    const query = parsed.searchParams.toString();
    return query ? `/mobile-auth/callback?${query}` : "/mobile-auth/callback";
  } catch {
    return null;
  }
}

export function NativeAppBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!isMobileAppTarget()) return;

    let removeListener: (() => Promise<void>) | undefined;

    const setup = async () => {
      try {
        const [{ App }, { Browser }, { Capacitor }] = await Promise.all([
          import("@capacitor/app"),
          import("@capacitor/browser"),
          import("@capacitor/core"),
        ]);

        if (!Capacitor.isNativePlatform()) return;

        const handleUrl = async (url?: string) => {
          const route = url ? mapIncomingUrlToRoute(url) : null;
          if (!route) return;

          try {
            await Browser.close();
          } catch {
            // no-op
          }

          router.replace(route);
        };

        const listener = await App.addListener("appUrlOpen", ({ url }) => {
          void handleUrl(url);
        });

        removeListener = listener.remove;

        const launch = await App.getLaunchUrl();
        if (launch?.url) {
          await handleUrl(launch.url);
        }
      } catch {
        // Capacitor not available in navigateur classique
      }
    };

    void setup();

    return () => {
      if (removeListener) {
        void removeListener();
      }
    };
  }, [router]);

  return null;
}
