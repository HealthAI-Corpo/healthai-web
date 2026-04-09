"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Eye, Lock, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDataQuality } from "@/lib/hooks/useApi";
import { useToast } from "@/components/ui/Toast";
import { formatNumber, formatDate } from "@/lib/utils";

type ValidationStatus = "pending" | "approved" | "rejected";

interface ValidationItem {
  id: string;
  dataset: string;
  sourceFile: string;
  pipelineRun: string;
  rowsTotal: number;
  rowsValid: number;
  anomalies: number;
  submittedAt: string;
  status: ValidationStatus;
  reviewer?: string;
  comment?: string;
  requiresInspection: boolean; // bloqué si anomalies > 0 et non inspecté
}

// Datasets du projet avec leur vrai fichier source
const INITIAL_ITEMS: ValidationItem[] = [
  {
    id: "v1", dataset: "Gym Members", sourceFile: "gym_members_exercise_tracking.csv",
    pipelineRun: "Import Gym Members Dataset", rowsTotal: 973, rowsValid: 973,
    anomalies: 4, submittedAt: "2024-07-21T06:02:44Z", status: "pending", requiresInspection: true,
  },
  {
    id: "v2", dataset: "Gym Synthetic", sourceFile: "gym_members_exercise_tracking_synthetic_data.csv",
    pipelineRun: "Import Gym Synthetic Dataset", rowsTotal: 1812, rowsValid: 1800,
    anomalies: 12, submittedAt: "2024-07-21T06:05:12Z", status: "pending", requiresInspection: true,
  },
  {
    id: "v3", dataset: "Daily Food & Nutrition", sourceFile: "daily_food_nutrition_dataset.csv",
    pipelineRun: "Import Daily Food & Nutrition", rowsTotal: 659, rowsValid: 651,
    anomalies: 8, submittedAt: "2024-07-21T06:07:33Z", status: "pending", requiresInspection: true,
  },
  {
    id: "v4", dataset: "Diet Recommendations", sourceFile: "diet_recommendations_dataset.csv",
    pipelineRun: "Import Diet Recommendations", rowsTotal: 1000, rowsValid: 1000,
    anomalies: 0, submittedAt: "2024-07-21T06:09:55Z", status: "pending", requiresInspection: false,
  },
  {
    id: "v5", dataset: "ExerciseDB", sourceFile: "exercises.json",
    pipelineRun: "Import ExerciseDB (JSON)", rowsTotal: 873, rowsValid: 870,
    anomalies: 3, submittedAt: "2024-07-21T06:10:00Z", status: "pending", requiresInspection: true,
  },
  {
    id: "v6", dataset: "Fitness Tracker", sourceFile: "25.csv",
    pipelineRun: "Import Fitness Tracker", rowsTotal: 96, rowsValid: 0,
    anomalies: 96, submittedAt: "2024-07-21T06:11:05Z", status: "rejected",
    reviewer: "Système ETL",
    comment: "Colonne 'bool_of_active' contient des valeurs 0/1 non booléennes — conversion requise avant re-soumission.",
    requiresInspection: true,
  },
];

const STATUS_CONFIG = {
  approved: { label: "Approuvé",   badgeVariant: "success"     as const, icon: CheckCircle2 },
  rejected: { label: "Rejeté",     badgeVariant: "destructive" as const, icon: XCircle },
  pending:  { label: "En attente", badgeVariant: "warning"     as const, icon: Clock },
};

export default function ValidationPage() {
  const [items, setItems] = useState<ValidationItem[]>(INITIAL_ITEMS);
  const [comment, setComment] = useState<Record<string, string>>({});
  // Simule les datasets qui ont été inspectés (en prod : partagé avec datasets/page.tsx via état global)
  const [inspected, setInspected] = useState<Record<string, boolean>>({
    v4: true, // Diet Recommendations n'a aucune anomalie → auto-inspecté
  });

  const { toast } = useToast();

  const handleDecision = (id: string, decision: "approved" | "rejected") => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Blocage si le dataset a des anomalies et n'a pas été inspecté
    if (decision === "approved" && item.requiresInspection && !inspected[id]) {
      toast("error", `Inspectez d'abord "${item.dataset}" dans l'onglet Datasets avant d'approuver`);
      return;
    }

    setItems((prev) => prev.map((i) =>
      i.id === id ? { ...i, status: decision, reviewer: "Admin", comment: comment[id] || undefined } : i
    ));
    toast(decision === "approved" ? "success" : "warning",
      decision === "approved" ? `"${item.dataset}" approuvé ✓` : `"${item.dataset}" rejeté`
    );
  };

  // Simuler "j'ai inspecté ce dataset"
  const markAsInspected = (id: string) => {
    setInspected((p) => ({ ...p, [id]: true }));
    toast("info", "Dataset marqué comme inspecté — vous pouvez maintenant l'approuver");
  };

  const pending  = items.filter((i) => i.status === "pending").length;
  const approved = items.filter((i) => i.status === "approved").length;
  const blocked  = items.filter((i) => i.status === "pending" && i.requiresInspection && !inspected[i.id]).length;

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Validation"
        description="Workflow d'approbation — les datasets avec anomalies doivent être inspectés avant validation"
        actions={
          <div className="flex items-center gap-2">
            {blocked > 0 && <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" aria-hidden="true" />{blocked} bloqué(s)</Badge>}
            {pending > 0 ? <Badge variant="warning">{pending} en attente</Badge> : <Badge variant="success">Tout validé</Badge>}
          </div>
        }
      />

      <div className="p-8 space-y-6">

        {/* Résumé */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "En attente", value: pending,  color: "text-warning" },
            { label: "Approuvés",  value: approved, color: "text-success" },
            { label: "Bloqués",    value: blocked,  color: "text-destructive" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`mt-1 text-3xl font-semibold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bannière si datasets bloqués */}
        {blocked > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3" role="alert">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {blocked} dataset(s) bloqué(s) — inspection requise avant approbation
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Allez dans <strong>Datasets</strong>, corrigez les anomalies, puis revenez ici pour valider.
              </p>
            </div>
            <Link href="/datasets">
              <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right" aria-label="Aller dans Datasets">
                Inspecter
              </Button>
            </Link>
          </div>
        )}

        {/* Liste des items */}
        <div className="space-y-4">
          {items.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            const StatusIcon = cfg.icon;
            const isPending = item.status === "pending";
            const isBlocked = isPending && item.requiresInspection && !inspected[item.id];
            const score = item.rowsTotal > 0 ? Math.round((item.rowsValid / item.rowsTotal) * 100) : 0;

            return (
              <Card key={item.id} className={isBlocked ? "border-destructive/30" : isPending ? "border-warning/30" : ""}>
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-4">

                    {/* Icône statut */}
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      item.status === "approved" ? "bg-success/10 text-success"
                      : item.status === "rejected" ? "bg-destructive/10 text-destructive"
                      : isBlocked ? "bg-destructive/10 text-destructive"
                      : "bg-warning/10 text-warning"
                    }`} aria-hidden="true">
                      {isBlocked ? <Lock className="h-5 w-5" /> : <StatusIcon className="h-5 w-5" />}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">

                      {/* En-tête */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-medium text-foreground">{item.dataset}</h3>
                        <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                        {isBlocked && <Badge variant="destructive"><Lock className="h-3 w-3 mr-1" />Inspection requise</Badge>}
                        {item.anomalies > 0 && (
                          <Badge variant={item.anomalies > 50 ? "destructive" : "warning"}>
                            <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                            {item.anomalies} anomalie{item.anomalies > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {inspected[item.id] && <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Inspecté</Badge>}
                      </div>

                      {/* Infos */}
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>
                          <span className="font-mono">{item.sourceFile}</span>
                          {" · "}{formatNumber(item.rowsTotal)} lignes · {formatNumber(item.rowsValid)} valides
                          {" · "}Score qualité <strong className={score >= 95 ? "text-success" : score >= 85 ? "text-warning" : "text-destructive"}>{score}%</strong>
                        </p>
                        <p>Soumis le {formatDate(item.submittedAt)}</p>
                      </div>

                      {/* Barre qualité */}
                      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted" aria-hidden="true">
                        <div className={`h-full rounded-full ${score >= 95 ? "bg-success" : score >= 85 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${score}%` }} />
                      </div>

                      {/* Commentaire existant */}
                      {item.comment && (
                        <p className="text-xs text-muted-foreground italic">
                          💬 {item.reviewer} : « {item.comment} »
                        </p>
                      )}

                      {/* Actions (dataset en attente) */}
                      {isPending && (
                        <div className="space-y-3 pt-1">
                          <div>
                            <label htmlFor={`comment-${item.id}`} className="text-xs font-medium text-foreground">
                              Commentaire de validation (optionnel)
                            </label>
                            <textarea
                              id={`comment-${item.id}`}
                              value={comment[item.id] ?? ""}
                              onChange={(e) => setComment((p) => ({ ...p, [item.id]: e.target.value }))}
                              placeholder="Ajouter une note avant approbation ou rejet…"
                              rows={2}
                              className="mt-1 w-full max-w-lg rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Bouton Inspecter (si bloqué) */}
                            {isBlocked ? (
                              <>
                                <Button variant="outline" size="sm" icon={Eye}
                                  onClick={() => markAsInspected(item.id)}
                                  aria-label={`Marquer "${item.dataset}" comme inspecté`}>
                                  Marquer comme inspecté
                                </Button>
                                <Link href="/datasets">
                                  <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right"
                                    aria-label="Aller dans Datasets pour inspecter">
                                    Ouvrir Datasets
                                  </Button>
                                </Link>
                              </>
                            ) : (
                              <>
                                <Button variant="primary" size="sm" icon={CheckCircle2}
                                  onClick={() => handleDecision(item.id, "approved")}
                                  aria-label={`Approuver le dataset ${item.dataset}`}>
                                  Approuver
                                </Button>
                                <Button variant="destructive" size="sm" icon={XCircle}
                                  onClick={() => handleDecision(item.id, "rejected")}
                                  aria-label={`Rejeter le dataset ${item.dataset}`}>
                                  Rejeter
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Note workflow */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-medium text-foreground">Workflow de validation</p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>1. Datasets</strong> → Consultez et corrigez les anomalies
            <span className="mx-2 text-muted-foreground">→</span>
            <strong>2. Validation</strong> → Approuvez ou rejetez chaque dataset
            <span className="mx-2 text-muted-foreground">→</span>
            <strong>3. Exports</strong> → Téléchargez les données validées (JSON / CSV)
            <span className="mx-2 text-muted-foreground">→</span>
            Prêt pour les modules <strong>IA</strong>
          </p>
        </div>

      </div>
    </div>
  );
}
