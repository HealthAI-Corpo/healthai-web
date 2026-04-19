import { type ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatNumber, WORKOUT_LABELS, PLAN_LABELS, EXPERIENCE_LABELS, MEAL_LABELS, EXERCISE_LEVEL_LABELS, DIET_LABELS } from "@/lib/utils";
import type { User, NutritionEntry, Exercise, DietRecommendation } from "@/types";

// ─── ActionCell ───────────────────────────────────────────────────────────────

function ActionCell({ onEdit, onDelete, label }: { onEdit: () => void; onDelete: () => void; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" icon={Edit2} onClick={onEdit} aria-label={`Modifier ${label}`} />
      <Button
        variant="ghost" size="sm" icon={Trash2} onClick={onDelete}
        aria-label={`Supprimer ${label}`}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      />
    </div>
  );
}

// ─── Champs éditables par dataset ────────────────────────────────────────────

export const USER_FIELDS = [
  { key: "name",             label: "Nom",              type: "text"   as const, required: true },
  { key: "age",              label: "Âge",              type: "number" as const },
  { key: "gender",           label: "Genre",            type: "select" as const, options: ["Male", "Female"] },
  { key: "weight_kg",        label: "Poids (kg)",       type: "number" as const },
  { key: "height_m",         label: "Taille (m)",       type: "number" as const },
  { key: "workout_type",     label: "Entraînement",     type: "select" as const, options: ["Yoga", "Strength", "Cardio", "HIIT"] },
  { key: "experience_level", label: "Niveau (1/2/3)",   type: "number" as const },
  { key: "plan",             label: "Plan",             type: "select" as const, options: ["free", "premium", "premium_plus"] },
];

export const NUTRITION_FIELDS = [
  { key: "food_item",        label: "Aliment",          type: "text"   as const, required: true },
  { key: "category",         label: "Catégorie",        type: "text"   as const },
  { key: "meal_type",        label: "Repas",            type: "select" as const, options: ["Breakfast", "Lunch", "Dinner", "Snack"] },
  { key: "calories_kcal",    label: "Calories",         type: "number" as const },
  { key: "protein_g",        label: "Protéines (g)",    type: "number" as const },
  { key: "carbohydrates_g",  label: "Glucides (g)",     type: "number" as const },
  { key: "fat_g",            label: "Lipides (g)",      type: "number" as const },
];

export const EXERCISE_FIELDS = [
  { key: "name",      label: "Nom",        type: "text"   as const, required: true },
  { key: "category",  label: "Catégorie",  type: "select" as const, options: ["strength", "stretching", "plyometrics", "strongman", "powerlifting", "cardio", "olympic weightlifting"] },
  { key: "level",     label: "Niveau",     type: "select" as const, options: ["beginner", "intermediate", "expert"] },
  { key: "equipment", label: "Équipement", type: "text"   as const },
];

export const DIET_FIELDS = [
  { key: "disease_type",         label: "Pathologie",     type: "text"   as const },
  { key: "severity",             label: "Sévérité",       type: "select" as const, options: ["Mild", "Moderate", "Severe"] },
  { key: "daily_caloric_intake", label: "Calories/j",     type: "number" as const },
  { key: "diet_recommendation",  label: "Recommandation", type: "select" as const, options: ["Balanced", "Low_Carb", "Low_Sodium"] },
];

// ─── Colonnes tableaux ────────────────────────────────────────────────────────

export function getUserColumns(
  onEdit: (row: User) => void,
  onDelete: (row: User) => void,
): ColumnDef<User>[] {
  return [
    { accessorKey: "name",             header: "Nom" },
    { accessorKey: "age",              header: "Âge" },
    { accessorKey: "gender",           header: "Genre" },
    { accessorKey: "weight_kg",        header: "Poids (kg)" },
    { accessorKey: "workout_type",     header: "Entraînement",  cell: ({ getValue }) => WORKOUT_LABELS[getValue<string>()] ?? getValue<string>() },
    { accessorKey: "experience_level", header: "Niveau",        cell: ({ getValue }) => WORKOUT_LABELS[getValue<string>() as keyof typeof WORKOUT_LABELS] ?? getValue<string>() },
    { accessorKey: "plan",             header: "Plan",          cell: ({ getValue }) => PLAN_LABELS[getValue<string>()] ?? getValue<string>() },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => (
        <ActionCell
          label={row.original.name ?? ""}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
        />
      ),
    },
  ];
}

export function getNutritionColumns(
  onEdit: (row: NutritionEntry) => void,
  onDelete: (row: NutritionEntry) => void,
): ColumnDef<NutritionEntry>[] {
  return [
    { accessorKey: "food_item",       header: "Aliment" },
    { accessorKey: "category",        header: "Catégorie" },
    { accessorKey: "meal_type",       header: "Repas",     cell: ({ getValue }) => MEAL_LABELS[getValue<string>()] ?? getValue<string>() },
    { accessorKey: "calories_kcal",   header: "Calories",  cell: ({ getValue }) => `${formatNumber(getValue<number>())} kcal` },
    { accessorKey: "protein_g",       header: "Protéines", cell: ({ getValue }) => `${getValue<number>()} g` },
    { accessorKey: "carbohydrates_g", header: "Glucides",  cell: ({ getValue }) => `${getValue<number>()} g` },
    { accessorKey: "fat_g",           header: "Lipides",   cell: ({ getValue }) => `${getValue<number>()} g` },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => (
        <ActionCell
          label={(row.original as unknown as Record<string, string>).food_item}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
        />
      ),
    },
  ];
}

export function getExerciseColumns(
  onEdit: (row: Exercise) => void,
  onDelete: (row: Exercise) => void,
): ColumnDef<Exercise>[] {
  return [
    { accessorKey: "name",      header: "Nom" },
    { accessorKey: "category",  header: "Catégorie" },
    { accessorKey: "level",     header: "Niveau",     cell: ({ getValue }) => EXERCISE_LEVEL_LABELS[getValue<string>()] ?? getValue<string>() },
    { accessorKey: "equipment", header: "Équipement" },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => (
        <ActionCell
          label={row.original.name ?? ""}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
        />
      ),
    },
  ];
}

export function getDietColumns(
  onEdit: (row: DietRecommendation) => void,
  onDelete: (row: DietRecommendation) => void,
): ColumnDef<DietRecommendation>[] {
  return [
    { accessorKey: "disease_type",         header: "Pathologie" },
    { accessorKey: "severity",             header: "Sévérité" },
    { accessorKey: "daily_caloric_intake", header: "Calories/j",     cell: ({ getValue }) => `${formatNumber(getValue<number>())} kcal` },
    { accessorKey: "diet_recommendation",  header: "Recommandation", cell: ({ getValue }) => DIET_LABELS[getValue<string>()] ?? getValue<string>() },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => (
        <ActionCell
          label={(row.original as unknown as Record<string, string>).disease_type ?? ""}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original)}
        />
      ),
    },
  ];
}