import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Activity className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="text-center">
        <h1 className="font-display text-6xl font-semibold text-foreground">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">Page introuvable</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Link
        href="/overview"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour au dashboard
      </Link>
    </div>
  );
}
