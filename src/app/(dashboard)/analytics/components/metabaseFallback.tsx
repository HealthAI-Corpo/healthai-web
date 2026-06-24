"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import {
  useDailyTracking,
  useDataQuality,
  useDietRecommendations,
  useNutrition,
  useUsers,
  useWorkoutLogs,
} from "@/lib/hooks/useApi";
import { formatNumber } from "@/lib/utils";

const PALETTE = ["#0f766e", "#0f172a", "#f59e0b", "#ef4444", "#2563eb", "#7c3aed"];

export type MetabaseFallbackKind =
  | "subscriptions"
  | "weight-trend"
  | "meal-distribution"
  | "workout-history"
  | "diet-recommendations"
  | "etl-quality";

function EmptyState({ message, height }: { message: string; height: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 text-center text-sm text-muted-foreground"
      style={{ height }}
    >
      {message}
    </div>
  );
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function SubscriptionChart({ height }: { height: number }) {
  const { data, isLoading } = useUsers();

  if (isLoading) return <ChartSkeleton height={height} />;

  const counts = (data ?? []).reduce<Record<string, number>>((acc, user) => {
    const record = user as Record<string, unknown>;
    const key =
      readString(record.plan) ??
      readString(record.typeAbonnement) ??
      "free";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }));

  if (!chartData.length) {
    return (
      <EmptyState
        height={height}
        message="Aucune donnée utilisateur disponible pour le mobile."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatNumber(value)} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function WeightTrendChart({ height }: { height: number }) {
  const { data, isLoading } = useDailyTracking();

  if (isLoading) return <ChartSkeleton height={height} />;

  const chartData = (data ?? [])
    .map((entry) => {
      const record = entry as Record<string, unknown>;
      const date =
        readString(record.dateLog) ?? readString(record.date) ?? "";
      const weight =
        readNumber(record.poidsKg) ?? readNumber(record.weight_kg);
      return { date, poids: weight };
    })
    .filter(
      (entry): entry is { date: string; poids: number } =>
        Boolean(entry.date) && entry.poids != null
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-8)
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      }),
      poids: entry.poids,
    }));

  if (!chartData.length) {
    return (
      <EmptyState
        height={height}
        message="Aucune mesure de poids disponible pour le mobile."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
        <XAxis dataKey="date" />
        <YAxis width={42} domain={["dataMin - 1", "dataMax + 1"]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="poids"
          stroke="#0f766e"
          strokeWidth={3}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MealDistributionChart({ height }: { height: number }) {
  const { data, isLoading } = useNutrition();

  if (isLoading) return <ChartSkeleton height={height} />;

  const totals = (data ?? []).reduce<Record<string, number>>((acc, item) => {
    const record = item as Record<string, unknown>;
    const key =
      readString(record.typeRepas) ??
      readString(record.meal_type) ??
      readString(record.categorie) ??
      readString(record.category) ??
      "Autres";
    const calories =
      readNumber(record.calories) ?? readNumber(record.calories_kcal) ?? 0;
    acc[key] = (acc[key] ?? 0) + calories;
    return acc;
  }, {});

  const chartData = Object.entries(totals)
    .map(([name, calories]) => ({ name, calories }))
    .sort((a, b) => b.calories - a.calories)
    .slice(0, 6);

  if (!chartData.length) {
    return (
      <EmptyState
        height={height}
        message="Aucune donnée nutritionnelle disponible pour le mobile."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis width={42} />
        <Tooltip formatter={(value: number) => `${formatNumber(value)} kcal`} />
        <Bar dataKey="calories" radius={[8, 8, 0, 0]} fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function WorkoutHistoryChart({ height }: { height: number }) {
  const { data, isLoading } = useWorkoutLogs();

  if (isLoading) return <ChartSkeleton height={height} />;

  const grouped = (data ?? []).reduce<Record<string, number>>((acc, log) => {
    const record = log as Record<string, unknown>;
    const date =
      readString(record.logDate) ??
      readString(record.dateLog) ??
      readString(record.log_date);
    if (!date) return acc;

    const calories =
      readNumber(record.calorieBrulee) ??
      readNumber(record.caloriesDepensees) ??
      readNumber(record.calories_burned) ??
      0;

    const key = new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
    acc[key] = (acc[key] ?? 0) + calories;
    return acc;
  }, {});

  const chartData = Object.entries(grouped)
    .map(([date, calories]) => ({ date, calories }))
    .slice(-7);

  if (!chartData.length) {
    return (
      <EmptyState
        height={height}
        message="Aucun historique de séance disponible pour le mobile."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis width={42} />
        <Tooltip formatter={(value: number) => `${formatNumber(value)} kcal`} />
        <Bar dataKey="calories" radius={[8, 8, 0, 0]} fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DietRecommendationsChart({ height }: { height: number }) {
  const { data, isLoading } = useDietRecommendations();

  if (isLoading) return <ChartSkeleton height={height} />;

  const grouped = (data ?? []).reduce<Record<string, number>>((acc, item) => {
    const record = item as Record<string, unknown>;
    const key =
      readString(record.recommandationRegime) ??
      readString(record.diet_recommendation) ??
      "Inconnue";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(grouped)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  if (!chartData.length) {
    return (
      <EmptyState
        height={height}
        message="Aucune recommandation disponible pour le mobile."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(value: number) => formatNumber(value)} />
        <Bar dataKey="total" radius={[0, 8, 8, 0]} fill="#7c3aed" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EtlQualityChart({ height }: { height: number }) {
  const { data, isLoading } = useDataQuality();

  if (isLoading) return <ChartSkeleton height={height} />;

  const chartData = (data ?? []).map((item) => ({
    dataset: item.dataset,
    score:
      item.total_rows > 0
        ? Math.round((item.valid_rows / item.total_rows) * 100)
        : 0,
  }));

  if (!chartData.length) {
    return (
      <EmptyState
        height={height}
        message="Aucune métrique ETL disponible pour le mobile."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d8" />
        <XAxis dataKey="dataset" tick={{ fontSize: 11 }} />
        <YAxis width={42} domain={[0, 100]} />
        <Tooltip formatter={(value: number) => `${value}%`} />
        <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#0f172a" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MetabaseFallback({
  kind,
  height,
}: {
  kind: MetabaseFallbackKind;
  height: number;
}) {
  switch (kind) {
    case "subscriptions":
      return <SubscriptionChart height={height} />;
    case "weight-trend":
      return <WeightTrendChart height={height} />;
    case "meal-distribution":
      return <MealDistributionChart height={height} />;
    case "workout-history":
      return <WorkoutHistoryChart height={height} />;
    case "diet-recommendations":
      return <DietRecommendationsChart height={height} />;
    case "etl-quality":
      return <EtlQualityChart height={height} />;
    default:
      return (
        <EmptyState
          height={height}
          message="Ce dashboard n'est pas encore disponible en mode mobile."
        />
      );
  }
}
