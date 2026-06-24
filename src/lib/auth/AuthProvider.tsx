"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SessionProvider, useSession } from "next-auth/react";
import {
  AUTH_CHANGE_EVENT,
  TOKEN_KEY,
  readStoredAuthState,
  type AppAuthState,
  type AppAuthSession,
} from "@/lib/auth/auth-session";
import { isMobileAppTarget } from "@/lib/runtime";

const AuthContext = createContext<AppAuthState>({
  status: "loading",
  session: null,
});

function WebAuthBridge({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (session?.accessToken) {
      localStorage.setItem(TOKEN_KEY, session.accessToken);
    } else if (status === "unauthenticated") {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [session?.accessToken, status, session]);

  const value = useMemo<AppAuthState>(() => {
    if (status === "loading") {
      return { status: "loading", session: null };
    }

    if (!session) {
      return { status: "unauthenticated", session: null };
    }

    const authSession: AppAuthSession = {
      accessToken: session.accessToken,
      user: {
        role: session.user.role,
        email: session.user.email,
        name: session.user.name,
      },
    };

    return { status: "authenticated", session: authSession };
  }, [session, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function MobileAuthBridge({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppAuthState>(() => readStoredAuthState());

  useEffect(() => {
    const sync = () => {
      setState(readStoredAuthState());
    };

    sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  if (isMobileAppTarget()) {
    return <MobileAuthBridge>{children}</MobileAuthBridge>;
  }

  return (
    <SessionProvider>
      <WebAuthBridge>{children}</WebAuthBridge>
    </SessionProvider>
  );
}

export function useAppAuth(): AppAuthState {
  return useContext(AuthContext);
}
