"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getRedirect, isPublicPath } from "@/lib/auth/helpers";
import { useAppAuth } from "@/lib/auth/AuthProvider";
import { isMobileAppTarget } from "@/lib/runtime";

export function RouteAccessGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, session } = useAppAuth();

  const redirectTarget = useMemo(() => {
    if (!isMobileAppTarget() || status === "loading") return null;
    return getRedirect(
      pathname,
      session ? { user: { role: session.user.role } } : null
    );
  }, [pathname, session, status]);

  useEffect(() => {
    if (!redirectTarget || redirectTarget === pathname) return;
    router.replace(redirectTarget);
  }, [pathname, redirectTarget, router]);

  if (!isMobileAppTarget()) {
    return <>{children}</>;
  }

  if (status === "loading" && !isPublicPath(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-sm text-muted-foreground">
        Initialisation de la session mobile…
      </div>
    );
  }

  if (redirectTarget && redirectTarget !== pathname) {
    return null;
  }

  return <>{children}</>;
}
