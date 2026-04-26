"use client";

import { Users, Activity, TrendingUp, ShieldCheck, GitMerge, AlertTriangle, Flame } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { PipelineStatusBadge } from "@/components/ui/Badge";
import { KpiCardSkeleton, ChartSkeleton } from "@/components/ui/Skeleton";
import { useKpis, usePipelineRuns, useDataQuality } from "@/lib/hooks/useApi";
import { MOCK_MONTHLY_PROGRESSION } from "@/lib/mock-data";
import { formatNumber, formatPercent, formatDate, formatDuration } from "@/lib/utils";
import { MetabaseEmbed } from "@/app/(dashboard)/analytics/components/metabaseEmbed";


export default function OverviewPage() {
  const { data: kpis, isLoading: kpisLoading } = useKpis();
  const { data: pipelines } = usePipelineRuns();
  const { data: quality } = useDataQuality();

  const latestRuns = pipelines?.slice(0, 5) ?? [];

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Dashboard"
        description={`Vue d'ensemble — données issues des ${formatNumber(973)} membres Kaggle`}
      />

      <div className="p-8 space-y-8">

        {/* KPIs */}
        <section aria-labelledby="kpis-title">
          <h2 id="kpis-title" className="sr-only">Indicateurs clés</h2>
          {kpisLoading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
            </div>
          ) : kpis ? (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard title="Membres total" value={formatNumber(kpis.total_users)}
                  description="gym_members_exercise_tracking.csv" icon={Users}
                  trend={{ value: 12.4, label: "ce mois", direction: "up" }} />
                <KpiCard title="Actifs 30 jours" value={formatNumber(kpis.active_users_last_30d)}
                  description="Sessions enregistrées" icon={Activity}
                  trend={{ value: 8.1, label: "vs mois dernier", direction: "up" }} variant="success" />
                <KpiCard title="Conversion Premium" value={formatPercent(kpis.premium_conversion_rate)}
                  description="Free → Premium / Premium+" icon={TrendingUp}
                  trend={{ value: 1.2, label: "ce mois", direction: "up" }} />
                <KpiCard title="Score qualité" value={`${kpis.data_quality_score} / 100`}
                  description="Cohérence & complétude" icon={ShieldCheck}
                  variant="success" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <KpiCard title="Durée session moy." value={`${kpis.avg_session_duration_hours}h`}
                  description="Moyenne réelle dataset" icon={Activity} />
                <KpiCard title="Calories brûlées moy." value={formatNumber(kpis.avg_calories_burned)}
                  description="kcal / session (dataset)" icon={Flame} variant="warning" />
                <KpiCard title="Taux d'erreur ETL" value={formatPercent(kpis.error_rate_percent)}
                  description="Rejets / total lignes" icon={AlertTriangle}
                  variant={kpis.error_rate_percent > 5 ? "destructive" : "warning"} />
              </div>
            </>
          ) : null}
        </section>

        {/* Graphique + Pipelines */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2" aria-labelledby="growth-title">
            <Card>
              <CardHeader>
                <CardTitle id="growth-title">Croissance utilisateurs</CardTitle>
                <CardDescription>Dashboard Metabase — données réelles BDD</CardDescription>
              </CardHeader>
              <CardContent>
                <MetabaseEmbed dashboardId={8} height={280} />
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="pipelines-title">
            <Card className="h-full">
              <CardHeader>
                <CardTitle id="pipelines-title">Pipelines ETL</CardTitle>
                <CardDescription>5 datasets — FastAPI Python</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2" aria-label="Derniers runs pipeline">
                  {latestRuns.map((run) => (
                    <li key={run.id} className="rounded-lg border border-border p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-foreground leading-tight truncate max-w-[140px]">
                          {run.dataset_file}
                        </span>
                        <PipelineStatusBadge status={run.status} />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="text-success">{formatNumber(run.rows_ingested)} ok</span>
                        {run.rows_rejected > 0 && (
                          <span className="text-destructive">{run.rows_rejected} rej.</span>
                        )}
                        <span className="ml-auto font-mono">{formatDuration(run.started_at, run.finished_at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Qualité des données */}
        <section aria-labelledby="quality-title">
          <Card>
            <CardHeader>
              <CardTitle id="quality-title">Qualité des datasets</CardTitle>
              <CardDescription>Résultats de l'analyse Pandas (ETL FastAPI)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Rapport qualité des datasets">
                  <thead>
                    <tr className="border-b border-border">
                      {["Dataset", "Fichier source", "Total", "Valides", "Manquantes", "Doublons", "Aberrations", "Score"].map((h) => (
                        <th key={h} scope="col" className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground last:pr-0">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(quality ?? []).map((row, index) => {
                      const score = row.total_rows > 0 ? Math.round((row.valid_rows / row.total_rows) * 100) : 0;
                      return (
                        <tr key={`${row.dataset}-${index}`} className="border-b border-border/50 last:border-0">
                          <td className="py-3 pr-4 font-medium text-foreground text-xs">{row.dataset}</td>
                          <td className="py-3 pr-4 font-mono text-[11px] text-muted-foreground">{row.source_file}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{formatNumber(row.total_rows)}</td>
                          <td className="py-3 pr-4 text-success">{formatNumber(row.valid_rows)}</td>
                          <td className="py-3 pr-4 text-warning">{row.missing_values}</td>
                          <td className="py-3 pr-4 text-warning">{row.duplicates}</td>
                          <td className="py-3 pr-4 text-destructive">{row.outliers}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                                <div className={`h-full rounded-full ${score >= 95 ? "bg-success" : score >= 85 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${score}%` }} />
                              </div>
                              <span className="text-xs font-medium">{score}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
}
