"use client";

import { useState } from "react";
import { RefreshCw, Filter, Play } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge, PipelineStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { usePipelineRuns, useTriggerPipeline } from "@/lib/hooks/useApi";
import { formatNumber, formatDate, formatDuration, SOURCE_LABELS } from "@/lib/utils";
import type { PipelineStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: PipelineStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "En cours", value: "running" },
  { label: "Succès", value: "success" },
  { label: "Erreur", value: "error" },
  { label: "En attente", value: "idle" },
];

// Datasets du projet avec leur taille réelle
const DATASET_INFO: Record<string, string> = {
  "gym_members_exercise_tracking.csv": "973 lignes",
  "gym_members_exercise_tracking_synthetic_data.csv": "1 800 lignes",
  "daily_food_nutrition_dataset.csv": "651 lignes",
  "diet_recommendations_dataset.csv": "1 000 lignes",
  "exercises.json": "873 exercices",
  "25.csv": "96 lignes",
};

export default function PipelinesPage() {
  const [filter, setFilter] = useState<PipelineStatus | "all">("all");
  const { data: runs, isLoading, refetch } = usePipelineRuns();
  const triggerMutation = useTriggerPipeline();

  const filtered = (runs ?? []).filter((r) => filter === "all" || r.status === filter);

  const stats = {
    total: (runs ?? []).length,
    success: (runs ?? []).filter((r) => r.status === "success").length,
    error: (runs ?? []).filter((r) => r.status === "error").length,
    running: (runs ?? []).filter((r) => r.status === "running").length,
  };

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Pipelines ETL"
        description="Monitoring des imports — 5 datasets Kaggle + ExerciseDB · ETL Python (FastAPI port 8000)"
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} loading={isLoading}
            onClick={() => refetch()} aria-label="Rafraîchir">
            Rafraîchir
          </Button>
        }
      />

      <div className="p-8 space-y-6">

        {/* Stats */}
        <section aria-labelledby="pipeline-stats-title">
          <h2 id="pipeline-stats-title" className="sr-only">Résumé des statuts</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total", value: stats.total, color: "text-foreground" },
              { label: "Succès", value: stats.success, color: "text-success" },
              { label: "Erreurs", value: stats.error, color: "text-destructive" },
              { label: "En cours", value: stats.running, color: "text-primary" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-5 pb-5">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={`mt-1 text-3xl font-semibold ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tableau */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Historique des exécutions</CardTitle>
                <CardDescription>Logs Pandas / SQLAlchemy · FastAPI port 8000</CardDescription>
              </div>
              <div className="flex items-center gap-2" role="group" aria-label="Filtrer par statut">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                {STATUS_FILTERS.map((f) => (
                  <button key={f.value} onClick={() => setFilter(f.value)} aria-pressed={filter === f.value}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Historique des pipelines ETL">
                <thead>
                  <tr className="border-b border-border">
                    {["Pipeline", "Fichier source", "Format", "Statut", "Lignes ok", "Rejetées", "Durée", "Démarré"].map((h) => (
                      <th key={h} scope="col" className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((run) => (
                    <>
                      <tr key={run.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3.5 pr-4 font-medium text-foreground max-w-[180px]">
                          <span className="block truncate text-xs">{run.name}</span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className="font-mono text-[11px] text-muted-foreground">{run.dataset_file}</span>
                          {DATASET_INFO[run.dataset_file] && (
                            <span className="ml-2 text-[10px] text-muted-foreground">({DATASET_INFO[run.dataset_file]})</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-4">
                          <Badge variant="outline">{SOURCE_LABELS[run.source]}</Badge>
                        </td>
                        <td className="py-3.5 pr-4"><PipelineStatusBadge status={run.status} /></td>
                        <td className="py-3.5 pr-4 text-success">{run.rows_ingested > 0 ? formatNumber(run.rows_ingested) : "—"}</td>
                        <td className="py-3.5 pr-4">
                          {run.rows_rejected > 0 ? <span className="text-destructive font-medium">{run.rows_rejected}</span> : <span className="text-muted-foreground">0</span>}
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-xs text-muted-foreground">{formatDuration(run.started_at, run.finished_at)}</td>
                        <td className="py-3.5 text-xs text-muted-foreground">{formatDate(run.started_at)}</td>
                      </tr>
                      {run.error_message && (
                        <tr key={`${run.id}-err`} className="border-b border-border/50">
                          <td colSpan={8} className="pb-3 pt-0">
                            <div className="flex items-start gap-2 rounded-lg bg-destructive/8 border border-destructive/20 px-3 py-2">
                              <span className="font-mono text-xs text-destructive">{run.error_message}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info stack */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground">Stack ETL</p>
          <p className="text-xs text-muted-foreground mt-1">
            Les pipelines sont exécutés par <strong>FastAPI (Python)</strong> avec <strong>Pandas</strong> pour le nettoyage
            et <strong>SQLAlchemy</strong> pour l'écriture en <strong>PostgreSQL</strong>.
            Les logs sont exposés via <code className="font-mono text-primary">GET /api/pipelines/runs</code>.
          </p>
        </div>

      </div>
    </div>
  );
}
