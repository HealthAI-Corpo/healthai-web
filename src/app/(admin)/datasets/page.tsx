"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EditRowModal } from "@/components/ui/EditRowModal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import {
  useUsers, useNutrition, useExercises, useDietRecommendations, useDataQuality,
  useUpdateAliment, useDeleteAliment, useUpdateExercice,
} from "@/lib/hooks/useApi";
import { useToast } from "@/components/ui/Toast";
import { formatNumber, formatDate } from "@/lib/utils";
import type { User, NutritionEntry, Exercise, DietRecommendation, Aliment, Exercice } from "@/types";

// ── Nouveaux imports (refacto) ────────────────────────────────────────────────
import { ImportCsvSection } from "./components/ImportCsvSection";
import { AnomaliesPanel } from "./components/AnomaliesPanel";
import {
  getUserColumns, getNutritionColumns, getExerciseColumns, getDietColumns,
  USER_FIELDS, NUTRITION_FIELDS, EXERCISE_FIELDS, DIET_FIELDS,
} from "./components/columns";

// ── MOCK — ancien code avant refacto (désactivé) ──────────────────────────────
// Si tu veux repasser en mode mock :
// 1. Remplace les imports useUpdateAliment/useDeleteAliment/useUpdateExercice par rien
// 2. Remplace les imports _components par les anciennes définitions inline de columns
// 3. Supprime <ImportCsvSection /> et <AnomaliesPanel /> du JSX
// 4. Dans .env.local : NEXT_PUBLIC_USE_MOCK=true
//
// import { type ColumnDef } from "@tanstack/react-table";
// import { Edit2, Trash2 } from "lucide-react";
// import { Button } from "@/components/ui/Button";
// import { formatNumber, formatDate, WORKOUT_LABELS, PLAN_LABELS,
//   EXPERIENCE_LABELS, MEAL_LABELS, EXERCISE_LEVEL_LABELS, DIET_LABELS } from "@/lib/utils";
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types locaux ─────────────────────────────────────────────────────────────

type DatasetKey = "users" | "nutrition" | "exercises" | "diet";

const TABS = [
  { id: "users",     label: "Gym Members",     desc: "gym_members_exercise_tracking.csv · 973 lignes" },
  { id: "nutrition", label: "Food & Nutrition", desc: "daily_food_nutrition_dataset.csv · 651 lignes" },
  { id: "exercises", label: "ExerciseDB",       desc: "exercises.json · 873 exercices" },
  { id: "diet",      label: "Diet Recomm.",      desc: "diet_recommendations_dataset.csv · 1000 lignes" },
  { id: "anomalies", label: "Anomalies ETL",    desc: "Logs ETL · table etl_log" },
];

// ─── Hook générique éditable ──────────────────────────────────────────────────

function useEditableDataset<T extends { id: string }>(initialData: T[] | undefined) {
  const [data, setData] = useState<T[] | null>(null);

  const init = useCallback((rows: T[]) => {
    setData((prev) => prev ?? rows);
  }, []);

  const updateRow = useCallback((id: string, values: Partial<T>) => {
    setData((prev) => prev?.map((r) => r.id === id ? { ...r, ...values } : r) ?? null);
  }, []);

  const deleteRow = useCallback((id: string) => {
    setData((prev) => prev?.filter((r) => r.id !== id) ?? null);
  }, []);

  return { rows: data ?? initialData ?? [], init, updateRow, deleteRow };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DatasetsPage() {
  const [activeTab, setActiveTab]   = useState("users");
  const [inspected, setInspected]   = useState<Record<string, boolean>>({});
  const [editModal, setEditModal]   = useState<{ open: boolean; row: Record<string, unknown> | null; dataset: DatasetKey | "" }>({ open: false, row: null, dataset: "" });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; label: string; dataset: DatasetKey | "" }>({ open: false, id: "", label: "", dataset: "" });

  const { toast } = useToast();

  // Données
  const { data: usersData,     isLoading: usersLoading }     = useUsers();
  const { data: nutritionData, isLoading: nutritionLoading } = useNutrition();
  const { data: exercisesData, isLoading: exercisesLoading } = useExercises();
  const { data: dietData,      isLoading: dietLoading }      = useDietRecommendations();
  const { data: quality }                                    = useDataQuality();

  // Mutations NestJS — appels réels à l'API
  // MOCK : ces 3 lignes n'existaient pas, tout était local (updateRow/deleteRow seulement)
  const updateAliment  = useUpdateAliment();
  const deleteAliment  = useDeleteAliment();
  const updateExercice = useUpdateExercice();

  // Datasets locaux éditables
  const users     = useEditableDataset<User>(usersData as unknown as User[]);
  const nutrition = useEditableDataset<NutritionEntry>(nutritionData as unknown as NutritionEntry[]);
  const exercises = useEditableDataset<Exercise>(exercisesData as unknown as Exercise[]);
  const diet      = useEditableDataset<DietRecommendation>(dietData as unknown as DietRecommendation[]);

  const markInspected = (id: string) => setInspected((p) => ({ ...p, [id]: true }));

  // ── Actions CRUD ─────────────────────────────────────────────────────────────
  // MOCK : handleSave faisait uniquement updateRow() local, sans appel API
  // MOCK : handleDelete faisait uniquement deleteRow() local, sans appel API

  const handleSave = async (values: Record<string, unknown>) => {
    const { dataset, row } = editModal;
    if (!row) return;
    try {
      if (dataset === "nutrition" && row.idAliment) {
        await updateAliment.mutateAsync({ idAliment: Number(row.idAliment), ...values } as Partial<Aliment> & { idAliment: number });
        nutrition.updateRow(row.id as string, values as Partial<NutritionEntry>);
      } else if (dataset === "exercises" && row.idExercice) {
        await updateExercice.mutateAsync({ idExercice: Number(row.idExercice), ...values } as Partial<Exercice> & { idExercice: number });
        exercises.updateRow(row.id as string, values as Partial<Exercise>);
      } else {
        if (dataset === "users") users.updateRow(row.id as string, values as Partial<User>);
        if (dataset === "diet")  diet.updateRow(row.id as string, values as Partial<DietRecommendation>);
      }
      toast("success", "Ligne mise à jour ✓");
    } catch {
      toast("error", "Erreur lors de la mise à jour");
    }
    setEditModal({ open: false, row: null, dataset: "" });
  };

  const handleDelete = async () => {
    const { id, label, dataset } = deleteModal;
    try {
      if (dataset === "nutrition") {
        await deleteAliment.mutateAsync(Number(id));
        nutrition.deleteRow(id);
        toast("success", `«${label}» supprimé`);
      } else {
        if (dataset === "users")     users.deleteRow(id);
        if (dataset === "exercises") exercises.deleteRow(id);
        if (dataset === "diet")      diet.deleteRow(id);
        toast("warning", `«${label}» supprimé localement`);
      }
    } catch {
      toast("error", "Erreur lors de la suppression");
    }
    setDeleteModal({ open: false, id: "", label: "", dataset: "" });
  };

  // ── Callbacks colonnes ────────────────────────────────────────────────────────

  const openEdit   = (dataset: DatasetKey) => (row: unknown) =>
    setEditModal({ open: true, row: row as Record<string, unknown>, dataset });

  const openDelete = (dataset: DatasetKey) => (row: unknown) => {
    const r = row as Record<string, unknown>;
    const label = (r.name ?? r.food_item ?? r.disease_type ?? "") as string;
    setDeleteModal({ open: true, id: r.id as string, label, dataset });
  };

  const userColumns      = getUserColumns(openEdit("users") as (r: User) => void,      openDelete("users") as (r: User) => void);
  const nutritionColumns = getNutritionColumns(openEdit("nutrition") as (r: NutritionEntry) => void, openDelete("nutrition") as (r: NutritionEntry) => void);
  const exerciseColumns  = getExerciseColumns(openEdit("exercises") as (r: Exercise) => void,  openDelete("exercises") as (r: Exercise) => void);
  const dietColumns      = getDietColumns(openEdit("diet") as (r: DietRecommendation) => void,      openDelete("diet") as (r: DietRecommendation) => void);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const totalAnomalies = (quality ?? []).reduce((s, d) => s + d.outliers + d.missing_values, 0);
  const dataTabs       = TABS.filter((t) => t.id !== "anomalies");
  const allInspected   = dataTabs.every((t) => inspected[t.id]);

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Datasets"
        description="Consultez, corrigez, importez des données — CRUD NestJS (port 3001) + ETL FastAPI (port 8000)"
        actions={
          allInspected
            ? <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />Tous inspectés</Badge>
            : <Badge variant="warning">{dataTabs.filter((t) => !inspected[t.id]).length} dataset(s) non inspecté(s)</Badge>
        }
      />

      <div className="p-8 space-y-6">

        {/* Alerte anomalies */}
        {totalAnomalies > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3" role="alert" aria-live="polite">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">{formatNumber(totalAnomalies)} anomalies détectées par l&apos;ETL</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Consultez l&apos;onglet <strong>Anomalies ETL</strong> pour le détail, corrigez via CRUD, puis re-importez si nécessaire.
              </p>
            </div>
          </div>
        )}

        {/* Import CSV — NOUVEAU (n'existait pas en mode mock) */}
        <ImportCsvSection />

        {/* Progression inspection */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground mb-3">Progression d&apos;inspection</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {dataTabs.map((tab) => (
              <div key={tab.id} className={`flex items-center gap-2 rounded-lg border p-3 ${inspected[tab.id] ? "border-success/40 bg-success/5" : "border-border"}`}>
                {inspected[tab.id]
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                  : <Eye className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                }
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{tab.label}</p>
                  <p className="text-[10px] text-muted-foreground">{inspected[tab.id] ? "Inspecté ✓" : "À inspecter"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Onglets */}
        <div role="tablist" aria-label="Sélectionner un dataset" className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => { setActiveTab(tab.id); if (tab.id !== "anomalies") markInspected(tab.id); }}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id !== "anomalies" && inspected[tab.id] && (
                <CheckCircle2 className="h-3 w-3 text-success" aria-label="Inspecté" />
              )}
              {tab.id === "anomalies" && totalAnomalies > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">!</span>
              )}
            </button>
          ))}
        </div>

        {/* Panel Gym Members */}
        <div role="tabpanel" id="panel-users" aria-labelledby="tab-users" hidden={activeTab !== "users"}>
          <Card>
            <CardHeader>
              <CardTitle>Profils membres · {formatNumber(users.rows.length)} lignes</CardTitle>
              <CardDescription>gym_members_exercise_tracking.csv · Kaggle</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? <TableSkeleton rows={5} /> : (
                <DataTable data={users.rows} columns={userColumns} searchable searchPlaceholder="Rechercher un membre…" caption="Profils gym members" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Nutrition */}
        <div role="tabpanel" id="panel-nutrition" aria-labelledby="tab-nutrition" hidden={activeTab !== "nutrition"}>
          <Card>
            <CardHeader>
              <CardTitle>Données nutritionnelles · {formatNumber(nutrition.rows.length)} lignes</CardTitle>
              <CardDescription>daily_food_nutrition_dataset.csv · Kaggle</CardDescription>
            </CardHeader>
            <CardContent>
              {nutritionLoading ? <TableSkeleton rows={5} /> : (
                <DataTable data={nutrition.rows} columns={nutritionColumns} searchable searchPlaceholder="Rechercher un aliment…" caption="Données nutritionnelles" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel ExerciseDB */}
        <div role="tabpanel" id="panel-exercises" aria-labelledby="tab-exercises" hidden={activeTab !== "exercises"}>
          <Card>
            <CardHeader>
              <CardTitle>Catalogue exercices · {formatNumber(exercises.rows.length)} exercices</CardTitle>
              <CardDescription>exercises.json · ExerciseDB fork GitHub</CardDescription>
            </CardHeader>
            <CardContent>
              {exercisesLoading ? <TableSkeleton rows={5} /> : (
                <DataTable data={exercises.rows} columns={exerciseColumns} searchable searchPlaceholder="Rechercher un exercice…" caption="Catalogue ExerciseDB" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Diet */}
        <div role="tabpanel" id="panel-diet" aria-labelledby="tab-diet" hidden={activeTab !== "diet"}>
          <Card>
            <CardHeader>
              <CardTitle>Recommandations diététiques · {formatNumber(diet.rows.length)} profils</CardTitle>
              <CardDescription>diet_recommendations_dataset.csv · Kaggle</CardDescription>
            </CardHeader>
            <CardContent>
              {dietLoading ? <TableSkeleton rows={5} /> : (
                <DataTable data={diet.rows} columns={dietColumns} searchable searchPlaceholder="Rechercher un profil patient…" caption="Recommandations diététiques" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel Anomalies ETL — NOUVEAU (n'existait pas en mode mock) */}
        <div role="tabpanel" id="panel-anomalies" aria-labelledby="tab-anomalies" hidden={activeTab !== "anomalies"}>
          <Card>
            <CardHeader>
              <CardTitle>Anomalies ETL</CardTitle>
              <CardDescription>Table <span className="font-mono">etl_log</span> — récupérée via FastAPI (port 8000)</CardDescription>
            </CardHeader>
            <CardContent>
              <AnomaliesPanel />
            </CardContent>
          </Card>
        </div>

        {/* Rapport qualité */}
        <Card>
          <CardHeader>
            <CardTitle>Rapport qualité par dataset</CardTitle>
            <CardDescription>Analyse Pandas — ETL FastAPI (port 8000)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(quality ?? []).map((d) => {
                const score = d.total_rows > 0 ? Math.round((d.valid_rows / d.total_rows) * 100) : 0;
                return (
                  <div key={d.dataset} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-medium text-sm">{d.dataset}</span>
                          <Badge variant={score >= 95 ? "success" : score >= 85 ? "warning" : "destructive"}>{score}% valide</Badge>
                          <span className="font-mono text-[11px] text-muted-foreground">{d.source_file}</span>
                        </div>
                        <div className="mt-1.5 flex gap-4 text-xs text-muted-foreground flex-wrap">
                          <span>{formatNumber(d.total_rows)} lignes</span>
                          <span className="text-success">{formatNumber(d.valid_rows)} valides</span>
                          {d.missing_values > 0 && <span className="text-warning">{d.missing_values} manquantes</span>}
                          {d.duplicates > 0 && <span className="text-warning">{d.duplicates} doublons</span>}
                          {d.outliers > 0 && <span className="text-destructive">{d.outliers} aberrations</span>}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        <p>Vérifié le</p>
                        <p>{formatDate(d.last_checked_at)}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                      <div
                        className={`h-full rounded-full ${score >= 95 ? "bg-success" : score >= 85 ? "bg-warning" : "bg-destructive"}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Modaux */}
      <EditRowModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, row: null, dataset: "" })}
        onSave={handleSave}
        row={editModal.row}
        fields={
          editModal.dataset === "users"     ? USER_FIELDS      :
          editModal.dataset === "nutrition" ? NUTRITION_FIELDS :
          editModal.dataset === "exercises" ? EXERCISE_FIELDS  : DIET_FIELDS
        }
        title={`Modifier une ligne — ${editModal.dataset}`}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: "", label: "", dataset: "" })}
        onConfirm={handleDelete}
        itemDescription={deleteModal.label}
      />
    </div>
  );
}