"use client";

import { useState, useCallback } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EditRowModal } from "@/components/ui/EditRowModal";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { useUsers, useNutrition, useExercises, useDietRecommendations, useDataQuality } from "@/lib/hooks/useApi";
import { useToast } from "@/components/ui/Toast";
import { formatNumber, formatDate, WORKOUT_LABELS, PLAN_LABELS, EXPERIENCE_LABELS, MEAL_LABELS, EXERCISE_LEVEL_LABELS, DIET_LABELS } from "@/lib/utils";
// Les colonnes utilisent la shape plate des mocks / données mappées.
// On type les colonnes avec Record<string, unknown> pour être agnostique à la source.
type Row = Record<string, unknown>;

// ─── Définition des champs éditables par dataset ─────────────────────────────

const USER_FIELDS = [
  { key: "name",              label: "Nom",                type: "text"   as const, required: true },
  { key: "age",               label: "Âge",                type: "number" as const, required: true },
  { key: "gender",            label: "Genre",              type: "select" as const, options: ["Male", "Female"] },
  { key: "weight_kg",         label: "Poids (kg)",         type: "number" as const },
  { key: "height_m",          label: "Taille (m)",         type: "number" as const },
  { key: "bmi",               label: "IMC",                type: "number" as const },
  { key: "workout_type",      label: "Type entraînement",  type: "select" as const, options: ["Yoga","Strength","Cardio","HIIT"] },
  { key: "experience_level",  label: "Niveau (1/2/3)",     type: "number" as const },
  { key: "calories_burned",   label: "Calories brûlées",   type: "number" as const },
  { key: "plan",              label: "Plan",               type: "select" as const, options: ["free","premium","premium_plus"] },
];

const NUTRITION_FIELDS = [
  { key: "food_item",        label: "Aliment",       type: "text"   as const, required: true },
  { key: "category",         label: "Catégorie",     type: "text"   as const },
  { key: "meal_type",        label: "Repas",         type: "select" as const, options: ["Breakfast","Lunch","Dinner","Snack"] },
  { key: "calories_kcal",    label: "Calories",      type: "number" as const },
  { key: "protein_g",        label: "Protéines (g)", type: "number" as const },
  { key: "carbohydrates_g",  label: "Glucides (g)",  type: "number" as const },
  { key: "fat_g",            label: "Lipides (g)",   type: "number" as const },
];

const EXERCISE_FIELDS = [
  { key: "name",      label: "Nom",        type: "text"   as const, required: true },
  { key: "category",  label: "Catégorie",  type: "select" as const, options: ["strength","stretching","plyometrics","strongman","powerlifting","cardio","olympic weightlifting"] },
  { key: "level",     label: "Niveau",     type: "select" as const, options: ["beginner","intermediate","expert"] },
  { key: "equipment", label: "Équipement", type: "text"   as const },
];

const DIET_FIELDS = [
  { key: "disease_type",             label: "Pathologie",             type: "text"   as const },
  { key: "severity",                 label: "Sévérité",               type: "select" as const, options: ["Mild","Moderate","Severe"] },
  { key: "daily_caloric_intake",     label: "Calories/jour",          type: "number" as const },
  { key: "diet_recommendation",      label: "Recommandation",         type: "select" as const, options: ["Balanced","Low_Carb","Low_Sodium"] },
  { key: "adherence_to_diet_plan",   label: "Adhérence (%)",          type: "number" as const },
];

// ─── Hook générique pour gérer un dataset éditable ────────────────────────────

function useEditableDataset<T extends object>(initialData: T[] | undefined) {
  const [data, setData] = useState<T[] | null>(null);

  const getId = (r: T) => (r as Record<string, unknown>).id as string;

  // Initialise depuis l'API dès que les données arrivent (une seule fois)
  const init = useCallback((rows: T[]) => {
    setData((prev) => prev ?? rows);
  }, []);

  const updateRow = useCallback((id: string, values: Partial<T>) => {
    setData((prev) => prev?.map((r) => getId(r) === id ? { ...r, ...values } : r) ?? null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteRow = useCallback((id: string) => {
    setData((prev) => prev?.filter((r) => getId(r) !== id) ?? null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = data ?? initialData ?? [];

  return { rows, init, updateRow, deleteRow };
}

// ─── Composant ActionCell : boutons Éditer / Supprimer ────────────────────────

function ActionCell({ onEdit, onDelete, label }: { onEdit: () => void; onDelete: () => void; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" icon={Edit2} onClick={onEdit} aria-label={`Modifier ${label}`} />
      <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete}
        aria-label={`Supprimer ${label}`}
        className="text-destructive hover:text-destructive hover:bg-destructive/10" />
    </div>
  );
}

const TABS = [
  { id: "users",     label: "Gym Members",        desc: "gym_members_exercise_tracking.csv · 973 lignes" },
  { id: "nutrition", label: "Food & Nutrition",   desc: "daily_food_nutrition_dataset.csv · 651 lignes" },
  { id: "exercises", label: "ExerciseDB",         desc: "exercises.json · 873 exercices" },
  { id: "diet",      label: "Diet Recomm.",        desc: "diet_recommendations_dataset.csv · 1000 lignes" },
];

export default function DatasetsPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [inspected, setInspected] = useState<Record<string, boolean>>({});

  // Modaux
  const [editModal, setEditModal]   = useState<{ open: boolean; row: Record<string,unknown> | null; dataset: string }>({ open: false, row: null, dataset: "" });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; label: string; dataset: string }>({ open: false, id: "", label: "", dataset: "" });

  const { toast } = useToast();

  // Données API
  const { data: usersRaw, isLoading: usersLoading } = useUsers();
  const { data: nutritionRaw, isLoading: nutritionLoading } = useNutrition();
  const { data: exercisesRaw, isLoading: exercisesLoading } = useExercises();
  const { data: dietRaw, isLoading: dietLoading } = useDietRecommendations();
  const { data: quality } = useDataQuality();

  type AnyRow = Record<string, unknown>;
  // Datasets éditables en local (prêt pour PATCH /api/users/:id)
  // Cast nécessaire : les hooks retournent une union mock/API que TS ne peut pas réconcilier
  const users     = useEditableDataset(usersRaw     as AnyRow[] | undefined);
  const nutrition = useEditableDataset(nutritionRaw as AnyRow[] | undefined);
  const exercises = useEditableDataset(exercisesRaw as AnyRow[] | undefined);
  const diet      = useEditableDataset(dietRaw      as AnyRow[] | undefined);

  // Initialiser dès que les données arrivent
  if (usersRaw && !users.rows.length)         users.init(usersRaw         as AnyRow[]);
  if (nutritionRaw && !nutrition.rows.length) nutrition.init(nutritionRaw as AnyRow[]);
  if (exercisesRaw && !exercises.rows.length) exercises.init(exercisesRaw as AnyRow[]);
  if (dietRaw && !diet.rows.length)           diet.init(dietRaw           as AnyRow[]);

  // Marquer un dataset comme inspecté
  const markInspected = (tabId: string) => {
    setInspected((p) => ({ ...p, [tabId]: true }));
  };

  // Ouvrir modal édition
  const openEdit = (row: Record<string,unknown>, dataset: string) => {
    setEditModal({ open: true, row, dataset });
    markInspected(dataset);
  };

  // Ouvrir modal suppression
  const openDelete = (id: string, label: string, dataset: string) => {
    setDeleteModal({ open: true, id, label, dataset });
    markInspected(dataset);
  };

  // Sauvegarder une modification
  const handleSave = (data: Record<string,unknown>) => {
    const id = editModal.row?.id as string;
    const ds = editModal.dataset;
    if (ds === "users")     users.updateRow(id, data);
    if (ds === "nutrition") nutrition.updateRow(id, data);
    if (ds === "exercises") exercises.updateRow(id, data);
    if (ds === "diet")      diet.updateRow(id, data);
    toast("success", "Ligne mise à jour — pensez à valider le dataset");
    // TODO: PATCH ${NESTJS_URL}/${ds}/${id} avec les nouvelles valeurs
  };

  // Supprimer une ligne
  const handleDelete = () => {
    const { id, dataset } = deleteModal;
    if (dataset === "users")     users.deleteRow(id);
    if (dataset === "nutrition") nutrition.deleteRow(id);
    if (dataset === "exercises") exercises.deleteRow(id);
    if (dataset === "diet")      diet.deleteRow(id);
    toast("success", "Ligne supprimée");
    // TODO: DELETE ${NESTJS_URL}/${dataset}/${id}
  };

  // ─── Colonnes par dataset ──────────────────────────────────────────────────

  const userColumns: ColumnDef<Row, unknown>[] = [
    { accessorKey: "name", header: "Nom", cell: ({ getValue }) => <span className="font-medium text-xs">{getValue() as string}</span> },
    { accessorKey: "age", header: "Âge", cell: ({ getValue }) => `${getValue()} ans` },
    { accessorKey: "gender", header: "Genre", cell: ({ getValue }) => getValue() as string },
    { accessorKey: "bmi", header: "IMC", cell: ({ getValue }) => {
      const v = getValue() as number;
      return <Badge variant={v < 25 ? "success" : v < 30 ? "warning" : "destructive"}>{v.toFixed(1)}</Badge>;
    }},
    { accessorKey: "workout_type", header: "Entraînement", cell: ({ getValue }) => WORKOUT_LABELS[getValue() as string] ?? getValue() as string },
    { accessorKey: "experience_level", header: "Niveau", cell: ({ getValue }) => EXPERIENCE_LABELS[getValue() as number] },
    { accessorKey: "calories_burned", header: "Calories", cell: ({ getValue }) => `${formatNumber(getValue() as number)} kcal` },
    { accessorKey: "plan", header: "Plan", cell: ({ getValue }) => {
      const p = getValue() as string;
      return <Badge variant={p === "premium_plus" ? "success" : p === "premium" ? "default" : "outline"}>{PLAN_LABELS[p]}</Badge>;
    }},
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <ActionCell
        label={row.original.name as string}
        onEdit={() => openEdit(row.original, "users")}
        onDelete={() => openDelete(row.original.id as string, row.original.name as string, "users")}
      />
    )},
  ];

  const nutritionColumns: ColumnDef<Row, unknown>[] = [
    { accessorKey: "food_item",       header: "Aliment",    cell: ({ getValue }) => <span className="font-medium text-xs">{getValue() as string}</span> },
    { accessorKey: "category",        header: "Catégorie",  cell: ({ getValue }) => <Badge variant="outline" className="text-[10px]">{getValue() as string}</Badge> },
    { accessorKey: "meal_type",       header: "Repas",      cell: ({ getValue }) => MEAL_LABELS[getValue() as string] ?? getValue() as string },
    { accessorKey: "calories_kcal",   header: "Calories",   cell: ({ getValue }) => `${getValue()} kcal` },
    { accessorKey: "protein_g",       header: "Protéines",  cell: ({ getValue }) => `${getValue()} g` },
    { accessorKey: "carbohydrates_g", header: "Glucides",   cell: ({ getValue }) => `${getValue()} g` },
    { accessorKey: "fat_g",           header: "Lipides",    cell: ({ getValue }) => `${getValue()} g` },
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <ActionCell
        label={row.original.food_item as string}
        onEdit={() => openEdit(row.original, "nutrition")}
        onDelete={() => openDelete(row.original.id as string, row.original.food_item as string, "nutrition")}
      />
    )},
  ];

  const exerciseColumns: ColumnDef<Row, unknown>[] = [
    { accessorKey: "name",     header: "Exercice", cell: ({ getValue }) => <span className="font-medium text-xs">{getValue() as string}</span> },
    { accessorKey: "category", header: "Catégorie", cell: ({ getValue }) => <Badge variant="outline" className="text-[10px] capitalize">{getValue() as string}</Badge> },
    { accessorKey: "level",    header: "Niveau", cell: ({ getValue }) => {
      const l = getValue() as string;
      return <Badge variant={l === "beginner" ? "success" : l === "intermediate" ? "default" : "warning"}>{EXERCISE_LEVEL_LABELS[l]}</Badge>;
    }},
    { accessorKey: "equipment", header: "Équipement", cell: ({ getValue }) => <span className="text-xs">{getValue() as string}</span> },
    { accessorKey: "primary_muscles", header: "Muscles", cell: ({ getValue }) => <span className="text-xs">{(getValue() as string[]).join(", ")}</span> },
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <ActionCell
        label={row.original.name as string}
        onEdit={() => openEdit(row.original, "exercises")}
        onDelete={() => openDelete(row.original.id as string, row.original.name as string, "exercises")}
      />
    )},
  ];

  const dietColumns: ColumnDef<Row, unknown>[] = [
    { accessorKey: "patient_id",           header: "Patient", cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
    { accessorKey: "disease_type",          header: "Pathologie" },
    { accessorKey: "severity",              header: "Sévérité", cell: ({ getValue }) => {
      const s = getValue() as string;
      return <Badge variant={s === "Severe" ? "destructive" : s === "Moderate" ? "warning" : "success"}>{s}</Badge>;
    }},
    { accessorKey: "daily_caloric_intake",  header: "Calories/j", cell: ({ getValue }) => `${formatNumber(getValue() as number)} kcal` },
    { accessorKey: "diet_recommendation",   header: "Recommandation", cell: ({ getValue }) => {
      const v = getValue() as string;
      return <Badge variant="default">{DIET_LABELS[v] ?? v}</Badge>;
    }},
    { accessorKey: "adherence_to_diet_plan",header: "Adhérence", cell: ({ getValue }) => `${getValue()} %` },
    { id: "actions", header: "Actions", cell: ({ row }) => (
      <ActionCell
        label={row.original.patient_id as string}
        onEdit={() => openEdit(row.original, "diet")}
        onDelete={() => openDelete(row.original.id as string, row.original.patient_id as string, "diet")}
      />
    )},
  ];

  const totalAnomalies = (quality ?? []).reduce((s, d) => s + d.outliers + d.missing_values, 0);
  const allInspected = TABS.every((t) => inspected[t.id]);

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Datasets"
        description="Consultez, corrigez et supprimez des lignes avant validation — NestJS CRUD API (port 3001)"
        actions={
          allInspected
            ? <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />Tous inspectés</Badge>
            : <Badge variant="warning">{TABS.filter((t) => !inspected[t.id]).length} dataset(s) non inspecté(s)</Badge>
        }
      />

      <div className="p-8 space-y-6">

        {/* Alerte anomalies */}
        {totalAnomalies > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/8 px-4 py-3" role="alert" aria-live="polite">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">{formatNumber(totalAnomalies)} anomalies détectées par l'ETL Pandas</p>
              <p className="text-xs text-muted-foreground mt-0.5">Inspectez chaque dataset, corrigez ou supprimez les lignes problématiques, puis allez sur <strong>Validation</strong> pour approuver.</p>
            </div>
          </div>
        )}

        {/* Progression inspection */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground mb-3">Progression d'inspection</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {TABS.map((tab) => (
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
              onClick={() => { setActiveTab(tab.id); markInspected(tab.id); }}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
              {inspected[tab.id] && (
                <CheckCircle2 className="h-3 w-3 text-success" aria-label="Inspecté" />
              )}
            </button>
          ))}
        </div>

        {/* Panel Gym Members */}
        <div role="tabpanel" id="panel-users" aria-labelledby="tab-users" hidden={activeTab !== "users"}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profils membres · {formatNumber(users.rows.length)} lignes</CardTitle>
                  <CardDescription>gym_members_exercise_tracking.csv · Kaggle</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? <TableSkeleton rows={5} /> : (
                <DataTable data={users.rows} columns={userColumns} searchable searchPlaceholder="Rechercher un membre…" caption="Tableau des profils gym members" />
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
                      <div className={`h-full rounded-full ${score >= 95 ? "bg-success" : score >= 85 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${score}%` }} />
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
