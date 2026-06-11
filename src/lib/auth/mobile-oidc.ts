"use client";

import { syncUtilisateur } from "@/lib/auth/helpers";
import {
  clearStoredSession,
  persistMobileSession,
  type StoredMobileTokens,
} from "@/lib/auth/auth-session";
import { isMobileAppTarget } from "@/lib/runtime";

const PKCE_STORAGE_KEY = "healthai_mobile_pkce";

interface PkceState {
  codeVerifier: string;
  state: string;
  redirectUri: string;
}

interface TokenResponse {
  access_token: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
}

function getIssuer(): string {
  const issuer = process.env.NEXT_PUBLIC_ZITADEL_ISSUER?.trim();
  if (!issuer) {
    throw new Error("NEXT_PUBLIC_ZITADEL_ISSUER est manquant.");
  }
  return issuer.replace(/\/$/, "");
}

function getClientId(): string {
  const clientId = process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_ZITADEL_CLIENT_ID est manquant.");
  }
  return clientId;
}

function getScopes(): string {
  return (
    process.env.NEXT_PUBLIC_ZITADEL_OIDC_SCOPES?.trim() ??
    "openid profile email offline_access"
  );
}

function getRedirectUri(): string {
  const configured = process.env.NEXT_PUBLIC_MOBILE_REDIRECT_URI?.trim();
  if (configured) return configured;

  if (typeof window !== "undefined") {
    if (window.location.protocol.startsWith("http")) {
      return `${window.location.origin}/mobile-auth/callback`;
    }
  }

  if (isMobileAppTarget()) {
    return "com.healthai.coach://auth/callback";
  }

  throw new Error("La redirection mobile ne peut être calculée côté serveur.");
}

function toBase64Url(value: Uint8Array): string {
  let binary = "";
  value.forEach((char) => {
    binary += String.fromCharCode(char);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(size = 32): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function createCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toBase64Url(new Uint8Array(digest));
}

function savePkceState(data: PkceState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(data));
}

function readPkceState(): PkceState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PKCE_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PkceState;
  } catch {
    localStorage.removeItem(PKCE_STORAGE_KEY);
    return null;
  }
}

function clearPkceState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PKCE_STORAGE_KEY);
}

export async function startMobileLogin(): Promise<void> {
  if (typeof window === "undefined") return;

  clearStoredSession();

  const codeVerifier = randomString(48);
  const state = randomString(24);
  const redirectUri = getRedirectUri();
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const issuer = getIssuer();
  const clientId = getClientId();

  savePkceState({ codeVerifier, state, redirectUri });

  const url = new URL(`${issuer}/oauth/v2/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", getScopes());
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);

  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: url.toString() });
      return;
    }
  } catch {
    // Fallback navigateur classique
  }

  window.location.assign(url.toString());
}

async function exchangeCodeForTokens(
  code: string,
  pkceState: PkceState
): Promise<StoredMobileTokens> {
  const issuer = getIssuer();
  const clientId = getClientId();
  const response = await fetch(`${issuer}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: pkceState.redirectUri,
      code_verifier: pkceState.codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error(`Échange du code échoué (HTTP ${response.status}).`);
  }

  const payload = (await response.json()) as TokenResponse;
  if (!payload.access_token) {
    throw new Error("Aucun access token reçu depuis ZITADEL.");
  }

  return {
    accessToken: payload.access_token,
    idToken: payload.id_token,
    refreshToken: payload.refresh_token,
    expiresAt: payload.expires_in
      ? Date.now() + payload.expires_in * 1000
      : undefined,
  };
}

export async function finishMobileLogin(
  params: URLSearchParams
): Promise<{ redirectTo: string }> {
  const code = params.get("code");
  const returnedState = params.get("state");
  const error = params.get("error");
  const errorDescription = params.get("error_description");

  if (error) {
    throw new Error(errorDescription ?? `Connexion refusée (${error}).`);
  }

  if (!code || !returnedState) {
    throw new Error("Réponse OIDC incomplète.");
  }

  const pkceState = readPkceState();
  if (!pkceState) {
    throw new Error("Session de connexion mobile introuvable.");
  }

  if (pkceState.state !== returnedState) {
    clearPkceState();
    throw new Error("État OAuth invalide, connexion annulée.");
  }

  const tokens = await exchangeCodeForTokens(code, pkceState);
  const session = persistMobileSession(tokens);
  clearPkceState();

  if (!session?.accessToken) {
    throw new Error("Impossible de créer la session mobile.");
  }

  await syncUtilisateur(session.accessToken);
  return { redirectTo: "/overview" };
}
