// Auth ZITADEL via next-auth (Auth.js v5)
// Le flow OIDC est géré par next-auth — l'access_token ZITADEL est
// synchronisé dans localStorage par TokenSync (providers.tsx) pour que
// nestFetch() / getAuthHeaders() puisse le lire sans être un hook.

import { useSession, signIn, signOut } from "next-auth/react";

const TOKEN_KEY = "healthai_jwt";

const NESTJS = process.env.NEXT_PUBLIC_NESTJS_URL ?? "http://localhost:3001";
// gardé pour les composants qui auraient besoin de l'URL de base
export { NESTJS };

// Headers Bearer + API Key à injecter sur chaque requête NestJS
export function getAuthHeaders(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? (localStorage.getItem(TOKEN_KEY) ?? "")
      : "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY ?? "",
    "x-client-id": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
  };
}

// Déclenche le flow OIDC ZITADEL (redirect)
export async function login(): Promise<void> {
  await signIn("zitadel", { callbackUrl: "/overview" });
}

// Déconnexion : vide localStorage + signOut next-auth
export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
  await signOut({ callbackUrl: "/login" });
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Hook React : indique si l'utilisateur est connecté
export function useIsAuthenticated(): boolean {
  const { data: session, status } = useSession();
  return status === "authenticated" && !!session;
}
