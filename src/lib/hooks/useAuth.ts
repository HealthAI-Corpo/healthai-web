// Gestion de l'auth NestJS — JWT + API Key + Client ID
// POST /auth/login → access_token stocké en localStorage
// Le token est lu par apiFetch() dans useApi.ts

import { useState, useEffect } from "react";

const TOKEN_KEY = "healthai_jwt";
const NESTJS = process.env.NEXT_PUBLIC_NESTJS_URL ?? "http://localhost:3001";

// headers communs à mettre sur chaque requête vers NestJS
export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem(TOKEN_KEY) ?? ""
    : "";
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
    // Ces deux clés sont définies dans .env.local
    "x-api-key":    process.env.NEXT_PUBLIC_API_KEY    ?? "",
    "x-client-id":  process.env.NEXT_PUBLIC_CLIENT_ID  ?? "",
  };
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${NESTJS}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key":   process.env.NEXT_PUBLIC_API_KEY   ?? "",
      "x-client-id": process.env.NEXT_PUBLIC_CLIENT_ID ?? "",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Login échoué (${res.status})`);
  }

  const { access_token } = await res.json();
  localStorage.setItem(TOKEN_KEY, access_token);
  return access_token;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  // pas de redirect ici — à gérer côté composant
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// hook pour savoir si on est connecté côté composant
export function useIsAuthenticated(): boolean {
  const [auth, setAuth] = useState(false);
  useEffect(() => {
    setAuth(!!localStorage.getItem(TOKEN_KEY));
  }, []);
  return auth;
}
