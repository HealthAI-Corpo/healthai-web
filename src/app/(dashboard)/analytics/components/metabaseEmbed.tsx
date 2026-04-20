"use client";

import { useEffect, useState } from "react";

interface Props {
  dashboardId: number;
  height?: number;
}

export function MetabaseEmbed({ dashboardId, height = 500 }: Props) {
  const [url, setUrl]     = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/metabase/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource: { dashboard: dashboardId }, params: {} }),
    })
      .then((r) => r.json())
      .then((d) => setUrl(d.url))
      .catch(() => setError(true));
  }, [dashboardId]);

  if (error) return (
    <p className="text-sm text-destructive">
      Impossible de charger le dashboard — vérifiez que METABASE_SECRET_KEY est configurée et que l&apos;embed est activé sur ce dashboard.
    </p>
  );

  if (!url) return (
    <div className="animate-pulse rounded-lg bg-muted" style={{ height }} />
  );

  return (
    <iframe
      src={url}
      style={{ height }}
      className="w-full rounded-lg border-0"
      allowTransparency
      title={`Dashboard Metabase ${dashboardId}`}
    />
  );
}