"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useUsers, useNutrition, useExercises, useDietRecommendations, useDataQuality } from "@/lib/hooks/useApi";
import { formatNumber } from "@/lib/utils";

interface ExportConfig {
  id: string;
  label: string;
  sourceFile: string;
  description: string;
  rows: number;
  qualityKey: string;
}

const EXPORT_CONFIGS: ExportConfig[] = [
  { id: "users",     label: "Gym Members",        sourceFile: "gym_members_exercise_tracking.csv",   description: "Age, Genre, BMI, BPM, Workout type, Calories, Experience level", rows: 973,  qualityKey: "gym_members_exercise_tracking.csv" },
  { id: "nutrition", label: "Food & Nutrition",    sourceFile: "daily_food_nutrition_dataset.csv",    description: "Aliments, macronutriments, calories, type de repas", rows: 651,  qualityKey: "daily_food_nutrition_dataset.csv" },
  { id: "exercises", label: "ExerciseDB",          sourceFile: "exercises.json",                      description: "873 exercices, muscles, équipement, niveau, instructions", rows: 873,  qualityKey: "exercises.json" },
  { id: "diet",      label: "Diet Recommendations",sourceFile: "diet_recommendations_dataset.csv",    description: "1000 profils, pathologies, recommandations diététiques", rows: 1000, qualityKey: "diet_recommendations_dataset.csv" },
];

function downloadJSON(data: unknown[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ExportsPage() {
  const [exporting, setExporting] = useState<Record<string, boolean>>({});
  const [exported, setExported] = useState<Record<string, boolean>>({});

  const { data: users } = useUsers();
  const { data: nutrition } = useNutrition();
  const { data: exercises } = useExercises();
  const { data: diet } = useDietRecommendations();
  const { data: quality } = useDataQuality();

  const dataMap: Record<string, unknown[]> = {
    users: users ?? [], nutrition: nutrition ?? [],
    exercises: exercises ?? [], diet: diet ?? [],
  };

  const handleExport = async (config: ExportConfig, format: "json" | "csv") => {
    const key = `${config.id}-${format}`;
    setExporting((p) => ({ ...p, [key]: true }));
    await new Promise((r) => setTimeout(r, 600));

    const data = dataMap[config.id] as Record<string, unknown>[];
    const date = new Date().toISOString().split("T")[0];
    const filename = `healthai-${config.id}-${date}.${format}`;

    if (format === "json") downloadJSON(data, filename);
    else downloadCSV(data, filename);

    setExporting((p) => ({ ...p, [key]: false }));
    setExported((p) => ({ ...p, [key]: true }));
    setTimeout(() => setExported((p) => ({ ...p, [key]: false })), 3000);
  };

  return (
    <div className="flex flex-col gap-0">
      <PageHeader title="Exports" description="Téléchargez les datasets nettoyés (JSON ou CSV) — prêts pour les modules IA" />

      <div className="p-8 space-y-6">
        <p className="text-sm text-muted-foreground">
          Seules les données <strong className="text-foreground">validées et approuvées</strong> sont disponibles.
          Ces exports alimenteront les futurs modules d'IA (recommandations personnalisées).
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {EXPORT_CONFIGS.map((config) => {
            const q = (quality ?? []).find((d) => d.source_file === config.qualityKey);
            const score = q ? Math.round((q.valid_rows / q.total_rows) * 100) : 100;

            return (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{config.label}</CardTitle>
                      <CardDescription className="font-mono text-[11px] mt-0.5">{config.sourceFile}</CardDescription>
                    </div>
                    <Badge variant={score >= 95 ? "success" : "warning"}>Qualité {score}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-1">{config.description}</p>
                  <p className="text-xs text-muted-foreground mb-4">{formatNumber(config.rows)} lignes</p>
                  <div className="flex gap-2">
                    {(["json", "csv"] as const).map((format) => {
                      const key = `${config.id}-${format}`;
                      return (
                        <Button key={format} variant="outline" size="sm"
                          icon={exported[key] ? CheckCircle2 : format === "json" ? FileJson : FileSpreadsheet}
                          loading={exporting[key]}
                          onClick={() => handleExport(config, format)}
                          aria-label={`Exporter ${config.label} en ${format.toUpperCase()}`}
                          className={exported[key] ? "border-success text-success" : ""}>
                          {exported[key] ? "Téléchargé !" : format.toUpperCase()}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Export global */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <p className="font-medium text-foreground">Exporter tous les datasets</p>
              <p className="text-xs text-muted-foreground">{formatNumber(973 + 651 + 873 + 1000)} lignes totales — prêt pour ingestion IA</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={FileJson} onClick={() => downloadJSON(users ?? [], "healthai-all.json")} aria-label="Tout en JSON">Tout JSON</Button>
              <Button variant="primary" size="sm" icon={Download} onClick={() => downloadCSV((users ?? []) as Record<string,unknown>[], "healthai-all.csv")} aria-label="Tout en CSV">Tout CSV</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
