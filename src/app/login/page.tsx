"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Eye, EyeOff, LogIn } from "lucide-react";
import { login } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
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
            <h1 className="font-display text-2xl font-semibold text-foreground">HealthAI Coach</h1>
            <p className="text-sm text-muted-foreground">Plateforme d'administration</p>
          </div>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-6 space-y-4"
          noValidate
          aria-label="Formulaire de connexion"
        >
          <h2 className="font-display text-base font-semibold text-foreground">Connexion</h2>

          {/* Erreur */}
          {error && (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@healthai.local"
              aria-required="true"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-required="true"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={LogIn}
            loading={loading}
            className="w-full"
            aria-label="Se connecter"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </Button>

          {/* Compte dev affiché seulement en mode mock/dev */}
          {process.env.NODE_ENV === "development" && (
            <p className="text-center text-[11px] text-muted-foreground">
              Compte dev : <code className="font-mono">dev-admin@healthai.local</code>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
