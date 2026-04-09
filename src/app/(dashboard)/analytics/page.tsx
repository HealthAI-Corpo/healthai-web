"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  MOCK_AGE_DISTRIBUTION, MOCK_WORKOUT_DISTRIBUTION, MOCK_EXPERIENCE_DISTRIBUTION,
  MOCK_PLANS_DISTRIBUTION, MOCK_MONTHLY_PROGRESSION, MOCK_NUTRITION_TRENDS,
  MOCK_TOP_EXERCISES, MOCK_DIET_DISTRIBUTION,
} from "@/lib/mock-data";
import { formatNumber, INTENSITY_LABELS } from "@/lib/utils";

const INTENSITY_COLORS: Record<string, string> = {
  low: "hsl(142,60%,45%)", moderate: "hsl(171,72%,28%)",
  high: "hsl(38,95%,55%)", very_high: "hsl(0,72%,51%)",
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Analytics"
        description="Visualisations issues des datasets Kaggle (973 membres, 873 exercices, 651 aliments)"
      />

      <div className="p-8 space-y-10">

        {/* ── Utilisateurs ──────────────────────────────────────── */}
        <section aria-labelledby="users-section">
          <h2 id="users-section" className="mb-4 font-display text-lg font-semibold text-foreground">
            Profils utilisateurs — <span className="text-muted-foreground text-base font-normal">gym_members_exercise_tracking.csv</span>
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Âge */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par âge</CardTitle>
                <CardDescription>973 membres · tranches de 10 ans</CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Histogramme répartition par âge">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={MOCK_AGE_DISTRIBUTION} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,88%)" vertical={false} />
                      <XAxis dataKey="range" tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid hsl(220,13%,88%)", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatNumber(v), "Membres"]} />
                      <Bar dataKey="count" name="Membres" fill="hsl(171,72%,28%)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Workout types */}
            <Card>
              <CardHeader>
                <CardTitle>Types d'entraînement</CardTitle>
                <CardDescription>4 types : Yoga, Strength, Cardio, HIIT</CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Graphique types d'entraînement">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={MOCK_WORKOUT_DISTRIBUTION} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {MOCK_WORKOUT_DISTRIBUTION.map((e) => <Cell key={e.type} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid hsl(220,13%,88%)", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatNumber(v), "membres"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1" aria-label="Légende workout types">
                  {MOCK_WORKOUT_DISTRIBUTION.map((e) => (
                    <li key={e.type} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: e.color }} aria-hidden="true" />
                        {e.type}
                      </span>
                      <span className="font-medium">{formatNumber(e.count)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Expérience + plans */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Niveau d'expérience</CardTitle>
                <CardDescription>Experience_Level : 1 Débutant · 2 Intermédiaire · 3 Avancé</CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Répartition niveaux expérience">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={MOCK_EXPERIENCE_DISTRIBUTION} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,88%)" vertical={false} />
                      <XAxis dataKey="level" tick={{ fontSize: 11, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid hsl(220,13%,88%)", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatNumber(v), "Membres"]} />
                      <Bar dataKey="count" radius={[4,4,0,0]}>
                        {MOCK_EXPERIENCE_DISTRIBUTION.map((e) => <Cell key={e.level} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plans d'abonnement</CardTitle>
                <CardDescription>Répartition Free / Premium / Premium+</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-2">
                  {MOCK_PLANS_DISTRIBUTION.map((p) => {
                    const total = MOCK_PLANS_DISTRIBUTION.reduce((s, x) => s + x.count, 0);
                    const pct = Math.round((p.count / total) * 100);
                    return (
                      <div key={p.plan}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{p.plan}</span>
                          <span className="text-muted-foreground">{formatNumber(p.count)} · {pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden" aria-hidden="true">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Nutrition ──────────────────────────────────────────── */}
        <section aria-labelledby="nutrition-section">
          <h2 id="nutrition-section" className="mb-4 font-display text-lg font-semibold text-foreground">
            Nutrition — <span className="text-muted-foreground text-base font-normal">daily_food_nutrition_dataset.csv · 651 aliments</span>
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Tendances macronutriments (hebdo)</CardTitle>
                <CardDescription>Calories, protéines, glucides, lipides — moyennes plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Tendances nutritionnelles hebdomadaires">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={MOCK_NUTRITION_TRENDS} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,88%)" />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid hsl(220,13%,88%)", borderRadius: "8px", fontSize: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                      <Line type="monotone" dataKey="calories" name="Calories (kcal)" stroke="hsl(171,72%,28%)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="protein" name="Protéines (g)" stroke="hsl(142,60%,45%)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="carbs" name="Glucides (g)" stroke="hsl(38,95%,55%)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="fat" name="Lipides (g)" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations diététiques</CardTitle>
                <CardDescription>diet_recommendations_dataset.csv · 1000 profils</CardDescription>
              </CardHeader>
              <CardContent>
                <div role="img" aria-label="Répartition des recommandations diététiques">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={MOCK_DIET_DISTRIBUTION} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                        {MOCK_DIET_DISTRIBUTION.map((e) => <Cell key={e.type} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid hsl(220,13%,88%)", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatNumber(v), "profils"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-1.5" aria-label="Légende recommandations">
                  {MOCK_DIET_DISTRIBUTION.map((d) => (
                    <li key={d.type} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                        {d.type.replace("_", " ")}
                      </span>
                      <span className="font-medium">{formatNumber(d.count)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Exercices ──────────────────────────────────────────── */}
        <section aria-labelledby="exercises-section">
          <h2 id="exercises-section" className="mb-4 font-display text-lg font-semibold text-foreground">
            Exercices — <span className="text-muted-foreground text-base font-normal">exercises.json (ExerciseDB fork) · 873 exercices</span>
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
              <CardDescription>7 catégories · niveaux beginner / intermediate / expert</CardDescription>
            </CardHeader>
            <CardContent>
              <div role="img" aria-label="Exercices par catégorie">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={MOCK_TOP_EXERCISES} layout="vertical" margin={{ top: 4, right: 32, bottom: 0, left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,88%)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} width={95} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid hsl(220,13%,88%)", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [formatNumber(v), "exercices"]} />
                    <Bar dataKey="sessions" name="Exercices" radius={[0,4,4,0]}>
                      {MOCK_TOP_EXERCISES.map((e) => <Cell key={e.name} fill={INTENSITY_COLORS[e.intensity] ?? "hsl(171,72%,28%)"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex flex-wrap gap-4" aria-label="Légende intensité">
                {Object.entries(INTENSITY_COLORS).map(([k, c]) => (
                  <span key={k} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-3 rounded-sm" style={{ background: c }} aria-hidden="true" />
                    {INTENSITY_LABELS[k]}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Progression mensuelle ─────────────────────────────── */}
        <section aria-labelledby="progression-section">
          <h2 id="progression-section" className="mb-4 font-display text-lg font-semibold text-foreground">
            Progression mensuelle
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Évolution des abonnements</CardTitle>
              <CardDescription>Janvier → Juillet 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div role="img" aria-label="Évolution mensuelle des abonnements">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={MOCK_MONTHLY_PROGRESSION} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,88%)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(220,10%,50%)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid hsl(220,13%,88%)", borderRadius: "8px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                    <Bar dataKey="users" name="Total" fill="hsl(171,72%,28%)" radius={[4,4,0,0]} />
                    <Bar dataKey="active" name="Actifs" fill="hsl(142,60%,45%)" radius={[4,4,0,0]} />
                    <Bar dataKey="premium" name="Premium" fill="hsl(38,95%,55%)" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
