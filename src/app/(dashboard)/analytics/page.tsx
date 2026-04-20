"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { MetabaseEmbed } from "./components/metabaseEmbed";
import { DASHBOARDS } from "./components/dashboards.config";

// ── MOCK — ancien code Recharts (désactivé) ───────────────────────────────────
// Si tu veux repasser aux graphiques mock Recharts :
// 1. NEXT_PUBLIC_USE_MOCK=true dans .env
// 2. Réimporte les composants Recharts et MOCK_DATA depuis lib/mock-data
// 3. Remplace le JSX ci-dessous par l'ancien contenu de la page
// ─────────────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Analytics"
        description="Tableaux de bord interactifs Metabase — données réelles BDD PostgreSQL"
      />

      <div className="p-8 space-y-8">
        {DASHBOARDS.map((db) => (
          <section key={db.id} aria-labelledby={`section-${db.id}`}>
            <h2
              id={`section-${db.id}`}
              className="mb-4 font-display text-lg font-semibold text-foreground"
            >
              {db.title}
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>{db.title}</CardTitle>
                <CardDescription>{db.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <MetabaseEmbed dashboardId={db.id} height={500} />
              </CardContent>
            </Card>
          </section>
        ))}
      </div>
    </div>
  );
}