// Logique d'auth pure (sans dépendance NextAuth) — testable unitairement.
// Consommée par src/auth.ts et src/middleware.ts.

// Claim Zitadel contenant les rôles du projet (nécessite
// "Assert Roles on Authentication" coché dans la console Zitadel)
export const ZITADEL_ROLES_CLAIM = "urn:zitadel:iam:org:project:roles";

export type UserRole = "admin" | "user";

// Routes du groupe (admin) — réservées au rôle "admin"
export const ADMIN_PATHS = ["/datasets", "/exports", "/validation"] as const;

export function extractRole(profile: Record<string, unknown>): UserRole {
  const roles = profile[ZITADEL_ROLES_CLAIM];
  if (roles && typeof roles === "object" && "admin" in roles) {
    return "admin";
  }
  return "user";
}

// Provisioning JIT : garantit que l'utilisateur connecté existe dans la
// BDD métier. Idempotent côté API — un échec ne bloque pas le login,
// le sync sera rejoué au prochain sign-in.
export async function syncUtilisateur(accessToken: string): Promise<void> {
  const baseUrl =
    process.env.NEXT_PUBLIC_NESTJS_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${baseUrl}/utilisateurs/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.error(`Sync utilisateur échoué: HTTP ${res.status}`);
    }
  } catch (error) {
    console.error("Sync utilisateur injoignable:", error);
  }
}

export function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/mobile-auth/callback" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export interface GuardSession {
  user: { role: UserRole };
}

/**
 * Décide de la redirection à appliquer pour une requête.
 * Retourne le chemin cible, ou null si la navigation est autorisée.
 */
export function getRedirect(
  pathname: string,
  session: GuardSession | null,
): string | null {
  if (!session && !isPublicPath(pathname)) {
    return "/login";
  }

  if (session && pathname === "/login") {
    return "/overview";
  }

  // Guard rôle : les pages admin redirigent les non-admins
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  if (session && isAdminPath && session.user.role !== "admin") {
    return "/overview";
  }

  return null;
}
