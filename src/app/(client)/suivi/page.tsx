"use client";
 
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { MetabaseEmbed } from "@/app/(dashboard)/analytics/components/metabaseEmbed";
 
const USER = {
  name: "Alexandre Martin",
  age: 29,
  weight: 78,
  height: 180,
  bmi: 24.1,
  goal: "Perte de poids",
  plan: "Premium",
  streak_days: 14,
  calories_target: 2100,
  workouts_this_week: 3,
  email: "alexandre@example.com",
};
 
const MB = { weight_trend: 3, calories_week: 1 };
 
interface ProfileField { label: string; value: string; }
 
const PROFILE_FIELDS: ProfileField[] = [
  { label: "Nom",              value: USER.name },
  { label: "Âge",              value: `${USER.age} ans` },
  { label: "Poids",            value: `${USER.weight} kg` },
  { label: "Taille",           value: `${USER.height} cm` },
  { label: "IMC",              value: String(USER.bmi) },
  { label: "Objectif",         value: USER.goal },
  { label: "Abonnement",       value: USER.plan },
  { label: "Série active",     value: `${USER.streak_days} jours` },
  { label: "Cible calorique",  value: `${USER.calories_target} kcal` },
];
 
export default function SuiviPage() {
  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Mon suivi"
        description="Visualisez votre progression et consultez votre profil"
      />
 
      <div className="p-8 space-y-8">
 
        {/* Courbe poids */}
        <section aria-labelledby="weight-title">
          <Card>
            <CardHeader>
              <CardTitle id="weight-title">Évolution du poids</CardTitle>
              <CardDescription>Données Metabase · sur les 8 dernières semaines</CardDescription>
            </CardHeader>
            <CardContent>
              <MetabaseEmbed
                dashboardId={MB.weight_trend}
                height={300}
                fallback="weight-trend"
              />
            </CardContent>
          </Card>
        </section>
 
        {/* Activité physique */}
        <section aria-labelledby="activity-title">
          <Card>
            <CardHeader>
              <CardTitle id="activity-title">Activité physique — semaine</CardTitle>
              <CardDescription>Données Metabase · calories brûlées par jour</CardDescription>
            </CardHeader>
            <CardContent>
              <MetabaseEmbed
                dashboardId={MB.calories_week}
                height={280}
                fallback="workout-history"
              />
            </CardContent>
          </Card>
        </section>
 
        {/* Profil */}
        <section aria-labelledby="profile-title">
          <Card>
            <CardHeader>
              <CardTitle id="profile-title">Mon profil</CardTitle>
              <CardDescription>Informations personnelles et paramètres de santé</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
                {PROFILE_FIELDS.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
 
              <div className="mt-6 border-t border-border pt-6">
                <button type="button" className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Modifier mon profil
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
 
      </div>
    </div>
  );
}
