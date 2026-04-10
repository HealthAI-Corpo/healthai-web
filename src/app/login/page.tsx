"use client";

import { useState } from "react";
import { Activity, LogIn } from "lucide-react";
import { login } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await login(); // déclenche le redirect OIDC vers ZITADEL
    } catch {
      setError("Connexion impossible. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-foreground">
              HealthAI Coach
            </h1>
            <p className="text-sm text-muted-foreground">
              Plateforme d&apos;administration
            </p>
          </div>
        </div>

        {/* Card connexion */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Connexion
          </h2>

          <p className="text-sm text-muted-foreground">
            Authentification sécurisée via ZITADEL. Tu seras redirigé vers la
            page de connexion de ton organisation.
          </p>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            icon={LogIn}
            loading={loading}
            onClick={handleLogin}
            className="w-full"
            aria-label="Se connecter avec ZITADEL"
          >
            {loading ? "Redirection…" : "Se connecter"}
          </Button>
        </div>
      </div>
    </div>
  );
}
