import { useAppAuth } from "@/lib/auth/AuthProvider";
import {
  clearStoredSession,
  readStoredToken,
  type AppAuthSession,
} from "@/lib/auth/auth-session";
import { startMobileLogin } from "@/lib/auth/mobile-oidc";
import { type UserRole } from "@/lib/auth/helpers";
import { isMobileAppTarget } from "@/lib/runtime";

const NESTJS = process.env.NEXT_PUBLIC_NESTJS_URL ?? "http://localhost:3001";
export { NESTJS };

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function login(): Promise<void> {
  if (isMobileAppTarget()) {
    await startMobileLogin();
    return;
  }

  const { signIn } = await import("next-auth/react");
  await signIn("zitadel", { callbackUrl: "/overview" });
}

export async function logout(): Promise<void> {
  clearStoredSession();

  if (isMobileAppTarget()) {
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
    return;
  }

  const { signOut } = await import("next-auth/react");
  await signOut({ callbackUrl: "/login" });
}

export function getToken(): string | null {
  return readStoredToken();
}

export function useIsAuthenticated(): boolean {
  return useAppAuth().status === "authenticated";
}

export function useCurrentRole(): UserRole | null {
  return useAppAuth().session?.user.role ?? null;
}

export function useCurrentAuthSession(): AppAuthSession | null {
  return useAppAuth().session;
}
