"use client";

// Intégration Metabase via iframe embed
//
// Pour activer :
// 1. Metabase > Paramètres > Embedding > Activer les embeds publics
// 2. Sur chaque dashboard : Partager > Embed > copier l'URL d'embed
// 3. Passer l'URL dans la prop embedUrl
//
// Pour les embeds signés (plus sécurisé) il faut METABASE_SECRET_KEY
// et générer le token côté serveur dans une Route Handler Next.js
// voir : https://www.metabase.com/docs/latest/embedding/signed-embedding

interface MetabaseDashboardProps {
  // URL d'embed copiée depuis Metabase (embed public ou signé)
  embedUrl: string;
  // hauteur de l'iframe en pixels
  height?: number;
  // titre accessible pour l'iframe (RGAA)
  titre: string;
}

export function MetabaseDashboard({
  embedUrl,
  height = 600,
  titre,
}: MetabaseDashboardProps) {
  const url = new URL(embedUrl);
  // paramètres recommandés pour un embed propre
  url.searchParams.set("bordered", "false");
  url.searchParams.set("titled", "false");
  url.searchParams.set("theme", "transparent");

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
      <iframe
        src={url.toString()}
        title={titre}
        style={{ height }}
        className="w-full"
        allowFullScreen
        // RGAA : l'iframe a toujours un titre
        aria-label={titre}
      />
    </div>
  );
}

// ─── Placeholder quand Metabase n'est pas encore configuré ───────────────────

export function MetabasePlaceholder({ message }: { message?: string }) {
  const metabaseUrl = process.env.NEXT_PUBLIC_METABASE_URL ?? "http://localhost:4000";

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center">
      <p className="text-sm font-medium text-foreground">Dashboard Metabase</p>
      <p className="text-xs text-muted-foreground max-w-sm">
        {message ?? "Configurez l'embed dans Metabase puis remplacez ce composant par <MetabaseDashboard embedUrl='...' />."}
      </p>
      <a
        href={metabaseUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        Ouvrir Metabase ({metabaseUrl})
      </a>
    </div>
  );
}
