"use client";

import { Suspense, useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { finishMobileLogin } from "@/lib/auth/mobile-oidc";

function MobileAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const completeLogin = async () => {
      try {
        const result = await finishMobileLogin(
          new URLSearchParams(searchParams.toString())
        );
        if (active) {
          router.replace(result.redirectTo);
        }
      } catch (value: unknown) {
        if (!active) return;
        setError(
          value instanceof Error
            ? value.message
            : "Connexion mobile impossible."
        );
      }
    };

    void completeLogin();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>

        <h1 className="font-display text-lg font-semibold text-foreground">
          Connexion mobile
        </h1>

        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Finalisation de la session sécurisée…
          </p>
        )}
      </div>
    </div>
  );
}

export default function MobileAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Préparation de la connexion mobile…
            </p>
          </div>
        </div>
      }
    >
      <MobileAuthCallbackContent />
    </Suspense>
  );
}
