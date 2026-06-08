import { API_URLS, authHeaders } from "./api.config";
import { pollUntilDone } from "./nutrition";

const WORKOUT = API_URLS.workout;

export interface Exercice {
  nom: string;
  type?: string;
  series?: number;
  repetitions?: number | string;
  duree_secondes?: number | null;
  repos_secondes?: number;
  muscles_cibles?: string;
  conseil?: string;
}

export interface GeneratedSession {
  id_seance_log?: number;
  log_date?: string;
  statut?: "proposee" | "prevue" | "en_cours" | "terminee";
  type_seance: string;
  titre_seance: string;
  duree_minutes: number;
  difficulte: string;
  objectif: string;
  conseils_generaux: string;
  exercices: Exercice[];
}

export interface WorkoutJob<T> {
  job_id: string;
  type: string;
  status: "processing" | "completed" | "failed";
  result: T | null;
  error: string | null;
  error_code: string | null;
}

export async function getWorkoutJob<T>(jobId: string): Promise<WorkoutJob<T>> {
  const res = await fetch(`${WORKOUT}/ai/jobs/${jobId}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Échec du polling job");
  return res.json();
}

export interface GenerateSessionParams {
  duree_souhaitee_minutes?: number;
  equipement_disponible?: string[];
  focus_musculaire?: string;
}

export async function generateSession(
  params: GenerateSessionParams = {},
  sauvegarder = false
) {
  const res = await fetch(
    `${WORKOUT}/ai/generate-session?sauvegarder=${sauvegarder}`,
    {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(params),
    }
  );
  if (!res.ok) throw new Error("Échec de la génération de séance");
  const { job_id } = await res.json();
  const job = await pollUntilDone<WorkoutJob<GeneratedSession>>(
    () => getWorkoutJob<GeneratedSession>(job_id)
  );
  if (job.status === "failed") throw new Error(job.error ?? "Erreur IA");
  return job.result!;
}

export async function getWorkoutRecommendation() {
  const res = await fetch(`${WORKOUT}/recommendations/workout`, {
    method: "POST",
    headers: await authHeaders(),
  });
  if (!res.ok) {
    if (res.status === 503) throw new Error("Le modèle de recommandation n'est pas encore disponible.");
    throw new Error("Échec de la recommandation");
  }
  const { job_id } = await res.json();
  const job = await pollUntilDone<WorkoutJob<{ seance: GeneratedSession }>>(
    () => getWorkoutJob(job_id)
  );
  if (job.status === "failed") throw new Error(job.error ?? "Erreur IA");
  return job.result;
}

export async function explainExercises(exercices: Partial<Exercice>[]) {
  const res = await fetch(`${WORKOUT}/ai/explain-exercises`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ exercices }),
  });
  if (!res.ok) throw new Error("Échec de l'explication");
  const { job_id } = await res.json();
  const job = await pollUntilDone<WorkoutJob<{
    explications: {
      nom: string;
      technique: string;
      erreurs_courantes: string[];
      variantes: string[];
      conseils_securite: string;
    }[];
  }>>(
    () => getWorkoutJob(job_id)
  );
  if (job.status === "failed") throw new Error(job.error ?? "Erreur IA");
  return job.result;
}

export async function predictCaloriesFromSession(idSeance: number) {
  const res = await fetch(`${WORKOUT}/calorie-estimation/predict-from-session`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ id_seance: idSeance }),
  });
  if (!res.ok) throw new Error("Échec de l'estimation depuis la séance");
  return res.json();
}