import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${formatNumber(n, decimals)} %`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDuration(startIso: string, endIso?: string): string {
  if (!endIso) return "En cours…";
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

// ─── Labels lisibles ──────────────────────────────────────────────────────────

export const WORKOUT_LABELS: Record<string, string> = {
  Yoga: "Yoga", Strength: "Musculation",
  Cardio: "Cardio", HIIT: "HIIT",
};

export const EXPERIENCE_LABELS: Record<number, string> = {
  1: "Débutant", 2: "Intermédiaire", 3: "Avancé",
};

export const PLAN_LABELS: Record<string, string> = {
  free: "Free", premium: "Premium", premium_plus: "Premium+",
};

export const INTENSITY_LABELS: Record<string, string> = {
  low: "Faible", moderate: "Modérée",
  high: "Haute", very_high: "Très haute",
};

export const SOURCE_LABELS: Record<string, string> = {
  csv: "CSV", json: "JSON", xlsx: "Excel", api: "API",
};

export const MEAL_LABELS: Record<string, string> = {
  Breakfast: "Petit-déjeuner", Lunch: "Déjeuner",
  Dinner: "Dîner", Snack: "Collation",
};

export const EXERCISE_LEVEL_LABELS: Record<string, string> = {
  beginner: "Débutant", intermediate: "Intermédiaire", expert: "Expert",
};

export const DIET_LABELS: Record<string, string> = {
  Balanced: "Équilibré", Low_Carb: "Faible en glucides", Low_Sodium: "Faible en sodium",
};
