"use client";

import { extractRole, type UserRole } from "@/lib/auth/helpers";

export const TOKEN_KEY = "healthai_jwt";
const MOBILE_SESSION_KEY = "healthai_mobile_session";
export const AUTH_CHANGE_EVENT = "healthai-auth-change";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AppAuthSession {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user: {
    role: UserRole;
    email?: string | null;
    name?: string | null;
    sub?: string | null;
  };
}

export interface AppAuthState {
  status: AuthStatus;
  session: AppAuthSession | null;
}

export interface StoredMobileTokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

interface JwtPayload extends Record<string, unknown> {
  sub?: string;
  email?: string;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return atob(padded);
}

export function decodeJwtPayload(token?: string): JwtPayload | null {
  if (!token) return null;

  const [, payload] = token.split(".");
  if (!payload) return null;

  try {
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

function getDisplayName(payload: JwtPayload | null): string | null {
  if (!payload) return null;
  if (typeof payload.name === "string" && payload.name.trim()) {
    return payload.name;
  }
  if (
    typeof payload.given_name === "string" &&
    typeof payload.family_name === "string"
  ) {
    return `${payload.given_name} ${payload.family_name}`.trim();
  }
  if (
    typeof payload.preferred_username === "string" &&
    payload.preferred_username.trim()
  ) {
    return payload.preferred_username;
  }
  return null;
}

export function buildSessionFromTokens(
  tokens: StoredMobileTokens
): AppAuthSession | null {
  const accessPayload = decodeJwtPayload(tokens.accessToken);
  if (!accessPayload) return null;

  const identityPayload = decodeJwtPayload(tokens.idToken) ?? accessPayload;
  const role = extractRole(accessPayload);

  return {
    ...tokens,
    user: {
      role,
      email:
        typeof identityPayload.email === "string"
          ? identityPayload.email
          : null,
      name: getDisplayName(identityPayload),
      sub: typeof accessPayload.sub === "string" ? accessPayload.sub : null,
    },
  };
}

export function dispatchAuthChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function persistMobileSession(
  tokens: StoredMobileTokens
): AppAuthSession | null {
  if (typeof window === "undefined") return null;

  const session = buildSessionFromTokens(tokens);
  if (!session) return null;

  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(MOBILE_SESSION_KEY, JSON.stringify(tokens));
  dispatchAuthChange();
  return session;
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MOBILE_SESSION_KEY);
  dispatchAuthChange();
}

export function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function readMobileSession(): AppAuthSession | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(MOBILE_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredMobileTokens;
    return buildSessionFromTokens(parsed);
  } catch {
    clearStoredSession();
    return null;
  }
}

export function readStoredAuthState(): AppAuthState {
  const session = readMobileSession();
  return {
    status: session ? "authenticated" : "unauthenticated",
    session,
  };
}
