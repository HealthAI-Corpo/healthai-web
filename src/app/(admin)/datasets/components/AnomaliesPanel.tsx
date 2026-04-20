"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, Database } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { formatNumber, formatDate } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EtlLog {
  id_etl_log: number;
  libelle_pipeline: string;
  fichier_nom: string;
  date_execution: string;
  nb_lignes_total: number;
  nb_lignes_valides: number;
  nb_lignes_anomalies: number;
  statut: "PENDING" | "SUCCESS" | "PARTIAL_FAILURE" | "FAILURE";
  message: string | null;
}

// ─── Mock fallback (si l'endpoint /etl-logs n'existe pas encore côté ETL) ────

const MOCK_ETL_LOGS: EtlLog[] = [
  {
    id_etl_log: 1,
    libelle_pipeline: "Pipeline Aliments",
    fichier_nom: "daily_food_nutrition_dataset.csv",
    date_execution: new Date().toISOString(),
    nb_lignes_total: 659,
    nb_lignes_valides: 651,
    nb_lignes_anomalies: 8,
    statut: "PARTIAL_FAILURE",
    message: "8 lignes rejetées : valeurs manquantes sur colonne 'calories'",
  },
  {
    id_etl_log: 2,
    libelle_pipeline: "Pipeline Exercices",
    fichier_nom: "exercises.json",
    date_execution: new Date().toISOString(),
    nb_lignes_total: 873,
    nb_lignes_valides: 870,
    nb_lignes_anomalies: 3,
    statut: "PARTIAL_FAILURE",
    message: "3 exercices sans muscle principal défini",
  },
  {
    id_etl_log: 3,
    libelle_pipeline: "Pipeline Recommandations",
    fichier_nom: "diet_recommendations_dataset.csv",
    date_execution: new Date().toISOString(),
    nb_lignes_total: 1000,
    nb_lignes_valides: 1000,
    nb_lignes_anomalies: 0,
    statut: "SUCCESS",
    message: null,
  },
];

const STATUT_CONFIG = {
  SUCCESS:         { label: "Succès",  variant: "success"     as const },
  PENDING:         { label: "En cours",variant: "warning"     as const },
  PARTIAL_FAILURE: { label: "Partiel", variant: "warning"     as const },
  FAILURE:         { label: "Échec",   variant: "destructive" as const },
};

// ─── Composant ────────────────────────────────────────────────────────────────

export function AnomaliesPanel() {
  const { toast } = useToast();
  const [logs, setLogs]     = useState<EtlLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);

  const FASTAPI = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${FASTAPI}/etl-logs`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data: EtlLog[] = await res.json();
      setLogs(data);
    } catch {
      // Endpoint pas encore dispo côté ETL → fallback mock
      toast("warning", "L'endpoint /etl-logs n'est pas encore disponible. Données d'exemple affichées.");
      setLogs(MOCK_ETL_LOGS);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Logs ETL issus de la table <span className="font-mono">etl_log</span> — chaque exécution de pipeline y est enregistrée avec le nombre d&apos;anomalies détectées.
        </p>
        <Button variant="outline" size="sm" icon={RefreshCw} loading={loading} onClick={fetchLogs}>
          {loaded ? "Rafraîchir" : "Charger les logs"}
        </Button>
      </div>

      {/* État vide */}
      {!loaded && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-12">
          <div className="text-center">
            <Database className="mx-auto h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Cliquez sur « Charger les logs » pour récupérer les anomalies ETL</p>
          </div>
        </div>
      )}

      {loaded && logs.length === 0 && (
        <div className="flex items-center justify-center rounded-xl border border-border py-8">
          <p className="text-sm text-muted-foreground">Aucun log ETL trouvé en base.</p>
        </div>
      )}

      {/* Liste des logs */}
      {loaded && logs.length > 0 && (
        <div className="space-y-3">
          {logs.map((log) => {
            const cfg = STATUT_CONFIG[log.statut];
            const score = log.nb_lignes_total > 0
              ? Math.round((log.nb_lignes_valides / log.nb_lignes_total) * 100)
              : 100;

            return (
              <Card key={log.id_etl_log} className={log.nb_lignes_anomalies > 0 ? "border-warning/40" : ""}>
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-2">

                    {/* En-tête */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{log.libelle_pipeline}</span>
                      <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      {log.nb_lignes_anomalies > 0 ? (
                        <Badge variant="warning">
                          <AlertTriangle className="h-3 w-3 mr-1" aria-hidden="true" />
                          {log.nb_lignes_anomalies} anomalie{log.nb_lignes_anomalies > 1 ? "s" : ""}
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                          Aucune anomalie
                        </Badge>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>
                        <span className="font-mono">{log.fichier_nom}</span>
                        {" · "}{formatNumber(log.nb_lignes_total)} lignes
                        {" · "}<span className="text-success">{formatNumber(log.nb_lignes_valides)} valides</span>
                        {log.nb_lignes_anomalies > 0 && (
                          <span className="text-warning"> · {formatNumber(log.nb_lignes_anomalies)} rejetées</span>
                        )}
                        {" · "}Score{" "}
                        <strong className={score >= 95 ? "text-success" : score >= 85 ? "text-warning" : "text-destructive"}>
                          {score}%
                        </strong>
                      </p>
                      <p>Exécuté le {formatDate(log.date_execution)}</p>
                    </div>

                    {/* Barre qualité */}
                    <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <div
                        className={`h-full rounded-full ${score >= 95 ? "bg-success" : score >= 85 ? "bg-warning" : "bg-destructive"}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    {/* Message */}
                    {log.message && (
                      <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-foreground">
                        <span className="font-medium text-warning">Détail : </span>
                        {log.message}
                      </div>
                    )}

                    {/* Conseil correction */}
                    {log.nb_lignes_anomalies > 0 && (
                      <p className="text-xs text-muted-foreground">
                        → Pour corriger, allez dans l&apos;onglet du dataset correspondant (édition CRUD) puis re-soumettez via un nouvel import.
                      </p>
                    )}

                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}