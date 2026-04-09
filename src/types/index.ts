// Types partagés — HealthAI Coach Admin
// Calqués sur les entités TypeORM du NestJS (voir healthai-api/src/modules/)
// Les noms correspondent aux champs JSON retournés par l'API après sérialisation

// ── Utilisateur (table: utilisateur) ─────────────────────────────────────────
// src/modules/utilisateur/entities/utilisateur.entity.ts

export type TypeAbonnement = "free" | "premium" | "premium_plus";
export type Genre = "Male" | "Female" | "Autre";

export interface Utilisateur {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  dateDeNaissance?: string;
  genre?: Genre;
  typeAbonnement?: TypeAbonnement;
  dateInscription: string;
  // profilSante chargé séparément si besoin
}

// ── Profil santé (table: profil_sante) ────────────────────────────────────────
// src/modules/profil-sante/entities/profil-sante.entity.ts

export interface ProfilSante {
  idProfilSante: number;
  idUtilisateur: number;
  poidsKg?: number;
  tailleCm?: number;
  imc?: number;
  objectif?: string;
  niveauActivite?: string;
  bpmMax?: number;
  bpmMoyen?: number;
  bpmRepos?: number;
  pourcentageGras?: number;
  typeEntrainementPrefere?: string;
  frequenceEntrainementSemaine?: number;
  dureeSessionHeures?: number;
  hydratationLitres?: number;
  niveauExperience?: number;
}

// ── Aliment (table: aliment) ──────────────────────────────────────────────────
// src/modules/aliment/entities/aliment.entity.ts

export interface Aliment {
  idAliment: number;
  nom: string;
  categorie?: string;
  typeRepas?: string;
  calories?: number;
  proteines?: number;
  lipides?: number;
  glucides?: number;
  fibres?: number;
  sucres?: number;
  sodiumMg?: number;
  cholesterolMg?: number;
  uniteMesure?: string;
}

// ── Exercice (table: exercice) ────────────────────────────────────────────────
// src/modules/exercice/entities/exercice.entity.ts

export interface Exercice {
  idExercice: number;
  nom: string;
  typeExercice?: string;
  musclePrincipal?: string;
  muscleSecondaire?: string;
  equipement?: string;
  difficulte?: string;   // "beginner" | "intermediate" | "expert"
  instructions?: string;
}

// ── Log santé (table: log_sante) ──────────────────────────────────────────────
// src/modules/log-sante/entities/log-sante.entity.ts

export interface LogSante {
  idLogSante: number;
  idUtilisateur: number;
  dateLog: string;
  poidsKg?: number;
  pourcentageGras?: number;
  imcActuel?: number;
  bpmMoyenJournee?: number;
  bpmRepos?: number;
  nbPas?: number;
  heuresSommeil?: number;
  hydratationLitres?: number;
}

// ── Log aliment (table: log_aliment) ─────────────────────────────────────────

export interface LogAliment {
  idLogAliment: number;
  idUtilisateur: number;
  idAliment: number;
  dateLog: string;
  typeRepas?: string;
  quantiteG?: number;
}

// ── Log séance (table: log_seance) ────────────────────────────────────────────

export interface LogSeance {
  idLogSeance: number;
  idUtilisateur: number;
  idExercice: number;
  dateSeance: string;
  dureeMinutes?: number;
  caloriesDepensees?: number;
  intensite?: string;
}

// ── Dataset recommandations régime ────────────────────────────────────────────
// src/modules/datasets/recommandations-regime/entities/recommandations-regime.entity.ts

export interface RecommandationRegime {
  idDatasetRecommandationsRegime: string;
  age?: number;
  sexe?: string;
  poidsKg?: number;
  tailleCm?: number;
  typeMaladie?: string;
  gravite?: string;
  niveauActivitePhysique?: string;
  apportCaloriqueJournalier?: number;
  cholesterolMgDl?: number;
  tensionArterielleMMHg?: number;
  glucoseMgDl?: number;
  restrictionsAlimentaires?: string;
  allergies?: string;
  cuisinePreferee?: string;
  heuresExerciceSemaine?: number;
  adherenceRegime?: number;
  scoreDesequilibreNutriment?: number;
  recommandationRegime?: string;
}

// ── Dataset historique séances exercice ───────────────────────────────────────

export interface HistoriqueSeanceExercice {
  idDatasetHistoriqueSeanceExercice: string;
  age?: number;
  genre?: string;
  poidsKg?: number;
  tailleM?: number;
  bpmMax?: number;
  bpmMoyen?: number;
  bpmRepos?: number;
  dureeSessionHeures?: number;
  caloriesDepensees?: number;
  typeEntrainement?: string;
  pourcentageGras?: number;
  hydratationLitres?: number;
  frequenceEntrainementSemaine?: number;
  niveauExperience?: number;
  imc?: number;
}

// ── Pipeline ETL (FastAPI) ────────────────────────────────────────────────────
// Expose par src/server.py du projet healthai-etl

export type StatutPipeline = "idle" | "running" | "success" | "error";
export type FormatSource = "csv" | "json" | "xlsx" | "api";

export interface PipelineRun {
  id: string;
  name: string;
  source: FormatSource;
  dataset_file: string;
  status: StatutPipeline;
  started_at: string;
  finished_at?: string;
  rows_ingested: number;
  rows_rejected: number;
  error_message?: string;
}

// ── KPIs dashboard ────────────────────────────────────────────────────────────

export interface DashboardKpis {
  total_users: number;
  active_users_last_30d: number;
  premium_conversion_rate: number;
  avg_session_duration_hours: number;
  avg_calories_burned: number;
  data_quality_score: number;
  pipelines_run_today: number;
  error_rate_percent: number;
}

// ── Rapport qualité dataset (FastAPI) ─────────────────────────────────────────

export interface RapportQualite {
  dataset: string;
  source_file: string;
  total_rows: number;
  valid_rows: number;
  missing_values: number;
  duplicates: number;
  outliers: number;
  last_checked_at: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: { total: number; page: number; perPage: number };
  error?: string;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

// Rétrocompat — alias utilisés dans les pages existantes
// à nettoyer quand on migre complètement vers l'API réelle
export type User = Utilisateur;
export type NutritionEntry = Aliment;
export type Exercise = Exercice;
export type DailyTracking = LogSante;
export type DietRecommendation = RecommandationRegime;
export type BusinessKpis = DashboardKpis;
export type DataQualityReport = RapportQualite;
export type PipelineStatus = StatutPipeline;
export type DataSource = FormatSource;
