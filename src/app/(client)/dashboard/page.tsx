"use client";
 
import { Scale, Ruler, Flame, Calendar, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { MetabaseEmbed } from "@/app/(dashboard)/analytics/components/metabaseEmbed";
 
// Profil mock — remplacer par useCurrentUser() en prod
const USER = {
  name: "Alexandre",
  weight: 78,
  bmi: 24.1,
  calories_target: 2100,
  age: 29,
  goal: "Perte de poids",
  plan: "premium" as const,
  workouts_this_week: 3,
  streak_days: 14,
};
 
// IDs Metabase — à ajuster avec les vrais IDs
const MB = { calories_week: 1, macros: 2 };
 
export default function ClientDashboardPage() {
  const isPremium = (USER.plan as string) !== "free";
 
  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title={`Bonjour, ${USER.name} 👋`}
        description={`Objectif : ${USER.goal} · Série en cours : ${USER.streak_days} jours 🔥`}
      />
 
      <div className="p-8 space-y-8">
 
        {/* KPIs */}
        <section aria-labelledby="kpis-title">
          <h2 id="kpis-title" className="sr-only">Indicateurs clés</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              title="Poids actuel"
              value={`${USER.weight} kg`}
              description="Dernière mesure enregistrée"
              icon={Scale}
              trend={{ value: 1.2, label: "ce mois", direction: "down" }}
              variant="success"
            />
            <KpiCard
              title="IMC"
              value={String(USER.bmi)}
              description="Indice de masse corporelle"
              icon={Ruler}
            />
            <KpiCard
              title="Cible calorique"
              value={`${USER.calories_target} kcal`}
              description="Objectif journalier"
              icon={Flame}
              variant="warning"
            />
            <KpiCard
              title="Séances / semaine"
              value={`${USER.workouts_this_week} / 5`}
              description="Objectif hebdomadaire"
              icon={Calendar}
              trend={{ value: USER.workouts_this_week * 20, label: "complété", direction: "up" }}
            />
          </div>
        </section>
 
        {/* Graphiques Metabase */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section aria-labelledby="calories-title">
            <Card>
              <CardHeader>
                <CardTitle id="calories-title">Calories brûlées — semaine</CardTitle>
                <CardDescription>Données Metabase · activité réelle</CardDescription>
              </CardHeader>
              <CardContent>
                <MetabaseEmbed dashboardId={MB.calories_week} height={260} />
              </CardContent>
            </Card>
          </section>
 
          <section aria-labelledby="macros-title">
            <Card>
              <CardHeader>
                <CardTitle id="macros-title">Répartition macronutriments</CardTitle>
                <CardDescription>Données Metabase · journée en cours</CardDescription>
              </CardHeader>
              <CardContent>
                <MetabaseEmbed dashboardId={MB.macros} height={260} />
              </CardContent>
            </Card>
          </section>
        </div>
 
        {/* Conseil IA du jour — Premium uniquement */}
        {isPremium && (
          <section aria-labelledby="tip-title">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TrendingDown className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="tip-title" className="font-display text-base font-semibold text-foreground">
                      Conseil IA du jour
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {USER.workouts_this_week} séances atteintes cette semaine — excellent travail ! Pour votre objectif{" "}
                      <em>{USER.goal}</em>, pensez à intégrer une séance de récupération active demain
                      (yoga léger ou marche de 30 min).
                    </p>
                    <div className="mt-3 flex gap-3">
                      <a
                        href="/client/nutrition"
                        className="text-xs font-medium text-primary hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        Voir mes recommandations nutrition →
                      </a>
                      <a
                        href="/client/sport"
                        className="text-xs font-medium text-primary hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        Mon programme sport →
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
 
        {/* CTA upgrade — Free uniquement */}
        {!isPremium && (
          <section aria-labelledby="upgrade-title">
            <Card className="text-center py-8">
              <CardContent className="pt-0 space-y-3">
                <p className="text-3xl" aria-hidden="true">⭐</p>
                <h2 id="upgrade-title" className="font-display text-lg font-semibold text-foreground">
                  Débloquez l'IA avec Premium
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Recommandations personnalisées, analyse de repas par photo et coaching sportif IA —
                  à partir de 9,99 €/mois.
                </p>
                <button type="button" className="mt-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Passer Premium
                </button>
              </CardContent>
            </Card>
          </section>
        )}
 
      </div>
    </div>
  );
}