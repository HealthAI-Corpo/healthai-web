// Hooks TanStack Query — HealthAI Coach Admin
//
// Stack :
//   NestJS  port 3001 → CRUD utilisateurs, aliments, exercices, séances, santé
//   FastAPI port 8000 → ETL pipelines, qualité données, upload fichiers
//   PostgreSQL        → base relationnelle (TypeORM côté NestJS, SQLAlchemy côté ETL)
//   Metabase          → dashboards embarqués (voir composant MetabaseDashboard)
//
// BASCULE MOCK/RÉEL : mettre USE_MOCK=false dans .env.local pour passer en mode réel
// En mode mock les données viennent de lib/mock-data.ts
// En mode réel chaque hook appelle l'API avec les bons headers NestJS

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "./useAuth";
import {
  MOCK_KPIS, MOCK_PIPELINE_RUNS, MOCK_DATA_QUALITY,
  MOCK_NUTRITION, MOCK_EXERCISES, MOCK_DAILY_TRACKING,
  MOCK_DIET_RECOMMENDATIONS, MOCK_USERS,
} from "@/lib/mock-data";
import type {
  Utilisateur, Aliment, Exercice, LogSante,
  RecommandationRegime, PipelineRun, DashboardKpis, RapportQualite,
  PaginationParams,
} from "@/types";

// bascule mock ↔ réel — mettre "false" dans .env.local pour l'API réelle
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

const NESTJS  = process.env.NEXT_PUBLIC_NESTJS_URL  ?? "http://localhost:3001";
const FASTAPI = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";

// délai simulé en mode mock — donne l'impression de vrai réseau
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── helper fetch NestJS ───────────────────────────────────────────────────────
// ajoute automatiquement Bearer JWT + x-api-key + x-client-id
async function nestFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${NESTJS}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Erreur ${res.status} sur ${path}`);
  }
  return res.json();
}

// helper fetch ETL FastAPI (pas d'auth pour l'instant)
async function etlFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${FASTAPI}${path}`, options);
  if (!res.ok) throw new Error(`ETL erreur ${res.status} sur ${path}`);
  return res.json();
}

// ── mapping API → types front ─────────────────────────────────────────────────
// l'API NestJS retourne du camelCase français, les mocks utilisent des champs anglais
// ces fonctions font le pont pour que les composants n'aient pas à changer

function mapUtilisateur(u: Utilisateur): Utilisateur & { id: string; name: string; plan: string } {
  return {
    ...u,
    id: String(u.idUtilisateur),
    // alias pour rétrocompat avec les colonnes des tableaux existants
    name: `${u.prenom} ${u.nom}`,
    plan: u.typeAbonnement ?? "free",
  };
}

function mapAliment(a: Aliment): Aliment & { id: string; food_item: string; calories_kcal: number; protein_g: number; carbohydrates_g: number; fat_g: number; meal_type: string } {
  return {
    ...a,
    id: String(a.idAliment),
    food_item: a.nom,
    calories_kcal: a.calories ?? 0,
    protein_g: a.proteines ?? 0,
    carbohydrates_g: a.glucides ?? 0,
    fat_g: a.lipides ?? 0,
    meal_type: a.typeRepas ?? "",
  };
}

function mapExercice(e: Exercice): Exercice & { id: string; name: string; level: string; primary_muscles: string[]; category: string } {
  return {
    ...e,
    id: String(e.idExercice),
    name: e.nom,
    level: e.difficulte ?? "beginner",
    primary_muscles: e.musclePrincipal ? [e.musclePrincipal] : [],
    category: e.typeExercice ?? "",
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// HOOKS NestJS — données métier
// ════════════════════════════════════════════════════════════════════════════════

// Liste des utilisateurs
// GET /utilisateurs — protégé JWT + API Key
export function useUsers(_params?: PaginationParams) {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (USE_MOCK) { await pause(300); return MOCK_USERS; }
      const data = await nestFetch<Utilisateur[]>("/utilisateurs");
      return data.map(mapUtilisateur);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Aliments (nutrition)
// GET /aliments
export function useNutrition(userId?: string) {
  return useQuery({
    queryKey: ["nutrition", userId],
    queryFn: async () => {
      if (USE_MOCK) {
        await pause(200);
        return userId
          ? MOCK_NUTRITION.filter((n) => (n as Record<string,unknown>).user_id === userId)
          : MOCK_NUTRITION;
      }
      const data = await nestFetch<Aliment[]>("/aliments");
      return data.map(mapAliment);
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Exercices (catalogue ExerciseDB)
// GET /exercices
export function useExercises(params?: { level?: string; category?: string }) {
  return useQuery({
    queryKey: ["exercises", params],
    queryFn: async () => {
      if (USE_MOCK) {
        await pause(200);
        let r = MOCK_EXERCISES;
        if (params?.level)    r = r.filter((e) => (e as Record<string,unknown>).level === params.level);
        if (params?.category) r = r.filter((e) => (e as Record<string,unknown>).category === params.category);
        return r;
      }
      const data = await nestFetch<Exercice[]>("/exercices");
      return data.map(mapExercice);
    },
    staleTime: 30 * 60 * 1000, // les exercices bougent rarement
  });
}

// Logs santé (tracking quotidien) — remplace DailyTracking
// GET /log-santes
export function useDailyTracking(userId?: string) {
  return useQuery({
    queryKey: ["tracking", userId],
    queryFn: async () => {
      if (USE_MOCK) {
        await pause(200);
        return userId
          ? MOCK_DAILY_TRACKING.filter((t) => (t as Record<string,unknown>).user_id === userId)
          : MOCK_DAILY_TRACKING;
      }
      const path = userId ? `/log-santes?idUtilisateur=${userId}` : "/log-santes";
      return nestFetch<LogSante[]>(path);
    },
  });
}

// Recommandations régime (dataset IA)
// GET /datasets/recommandations-regime
export function useDietRecommendations() {
  return useQuery({
    queryKey: ["diet-recommendations"],
    queryFn: async () => {
      if (USE_MOCK) { await pause(200); return MOCK_DIET_RECOMMENDATIONS; }
      return nestFetch<RecommandationRegime[]>("/datasets/recommandations-regime");
    },
    staleTime: 10 * 60 * 1000,
  });
}

// KPIs agrégés — calculés depuis la BDD PostgreSQL
// Pour l'instant pas d'endpoint dédié dans NestJS → on fait avec le health check
// et on complètera quand l'endpoint /analytics/kpis sera ajouté côté API
export function useKpis() {
  return useQuery({
    queryKey: ["kpis"],
    queryFn: async (): Promise<DashboardKpis> => {
      if (USE_MOCK) { await pause(150); return MOCK_KPIS as unknown as DashboardKpis; }

      const results = await Promise.allSettled([
        nestFetch<Utilisateur[]>("/utilisateurs"),
        nestFetch<Aliment[]>("/aliments"),
        nestFetch<Exercice[]>("/exercices"),
        nestFetch<any[]>("/logs-seance"),
        nestFetch<any[]>("/etl-log"),
      ]);

      const [users, aliments, exercices, seances, etlLogs] = results.map(r =>
        r.status === "fulfilled" ? (r.value as any[]) : []
      );
      // Ajoute ça juste après
console.log("seances[0]", seances[0]);
console.log("etlLogs[0]", etlLogs[0]);

      // Utilisateurs
      const total = users.length;
      const premium = users.filter((u: any) =>
        u.typeAbonnement && u.typeAbonnement !== "Freemium"
      ).length;

      // Calories brûlées réelles depuis log_seance
      const avgCalories = seances.length > 0
      ? Math.round(
          seances.reduce((s: number, r: any) =>
            s + (parseFloat(r.calorieBrulee) || 0), 0
          ) / seances.length
        )
      : 0;

      // Durée moyenne de session depuis log_seance
      const avgDuration = seances.length > 0
      ? Math.round(
          (seances.reduce((s: number, r: any) =>
            s + (parseFloat(r.dureeMinutes) || 0), 0
          ) / seances.length / 60) * 10
        ) / 10
      : 1.3;

      // Qualité ETL réelle depuis etl_log
      const totalLignes    = etlLogs.reduce((s: number, l: any) => s + (l.nbLignesTotal    ?? l.nb_lignes_total    ?? 0), 0);
      const totalValides   = etlLogs.reduce((s: number, l: any) => s + (l.nbLignesValides  ?? l.nb_lignes_valides  ?? 0), 0);
      const totalAnomalies = etlLogs.reduce((s: number, l: any) => s + (l.nbLignesAnomalies ?? l.nb_lignes_anomalies ?? 0), 0);

      const data_quality_score = totalLignes > 0
        ? Math.round((totalValides / totalLignes) * 100)
        : 94;

      const error_rate_percent = totalLignes > 0
        ? Math.round((totalAnomalies / totalLignes) * 100 * 10) / 10
        : 0;

      return {
        total_users: total,
        active_users_last_30d: Math.round(total * 0.72),
        premium_conversion_rate: total > 0 ? (premium / total) * 100 : 0,
        data_quality_score,
        avg_session_duration_hours: avgDuration,
        avg_calories_burned: avgCalories,
        error_rate_percent,
      } as unknown as DashboardKpis;
    },
    refetchInterval: 60 * 1000,
  });
}
// ════════════════════════════════════════════════════════════════════════════════
// HOOKS FastAPI ETL
// ════════════════════════════════════════════════════════════════════════════════

// Historique des runs pipeline
// GET /health pour l'instant (ETL pas encore d'endpoint /runs)
// On garde les mocks jusqu'à ce que l'ETL expose l'historique
export function usePipelineRuns() {
  return useQuery({
    queryKey: ["pipeline-runs"],
    queryFn: async (): Promise<PipelineRun[]> => {
      // Toujours mock — ETL n'expose pas encore /runs
      await pause(200);
      return MOCK_PIPELINE_RUNS as PipelineRun[];
    },
    refetchInterval: 30 * 1000,
  });
}

// Rapports qualité par dataset
// Même logique — pas encore exposé par FastAPI, on garde les mocks
export function useDataQuality() {
  return useQuery({
    queryKey: ["data-quality"],
    queryFn: async (): Promise<RapportQualite[]> => {
      if (USE_MOCK) { await pause(200); return MOCK_DATA_QUALITY as RapportQualite[]; }
      const logs = await nestFetch<any[]>("/etl-log");
      return logs.map(log => ({
        dataset: log.libellePipeline,
        source_file: log.fichierNom,
        total_rows: log.nbLignesTotal,
        valid_rows: log.nbLignesValides,
        missing_values: 0,
        duplicates: 0,
        outliers: log.nbLignesAnomalies,
        last_checked_at: log.dateExecution,
      }));
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ════════════════════════════════════════════════════════════════════════════════
// MUTATIONS NestJS
// ════════════════════════════════════════════════════════════════════════════════

// modifier un utilisateur — PATCH /utilisateurs/:id
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Utilisateur> & { idUtilisateur: number }) => {
      if (USE_MOCK) { await pause(400); return payload; }
      return nestFetch(`/utilisateurs/${payload.idUtilisateur}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// supprimer un utilisateur — DELETE /utilisateurs/:id
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (idUtilisateur: number) => {
      if (USE_MOCK) { await pause(300); return; }
      await nestFetch(`/utilisateurs/${idUtilisateur}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// modifier un aliment — PATCH /aliments/:id
export function useUpdateAliment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Aliment> & { idAliment: number }) => {
      if (USE_MOCK) { await pause(400); return payload; }
      return nestFetch(`/aliments/${payload.idAliment}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition"] }),
  });
}

// supprimer un aliment — DELETE /aliments/:id
export function useDeleteAliment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (idAliment: number) => {
      if (USE_MOCK) { await pause(300); return; }
      await nestFetch(`/aliments/${idAliment}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition"] }),
  });
}

// modifier un exercice — PATCH /exercices/:id
export function useUpdateExercice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Exercice> & { idExercice: number }) => {
      if (USE_MOCK) { await pause(400); return payload; }
      return nestFetch(`/exercices/${payload.idExercice}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
  });
}

// déclencher manuellement un pipeline — POST /upload (FastAPI)
// uploadFichier est dans useUpload.ts, ici c'est juste pour invalider les caches
export function useTriggerPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipelineId: string) => {
      if (USE_MOCK) { await pause(800); return { pipeline_id: pipelineId, status: "running" }; }
      // FastAPI pas encore d'endpoint /trigger — on appelle juste le health pour simuler
      return etlFetch<{ status: string }>("/health");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipeline-runs"] }),
  });
}

export { NESTJS as NESTJS_URL, FASTAPI as FASTAPI_URL };
