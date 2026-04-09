// ─────────────────────────────────────────────────────────────────────────────
// Données mockées — HealthAI Coach
//
// Ces données sont extraites et fidèles aux vrais datasets Kaggle :
//   - gym_members_exercise_tracking.csv (973 lignes)
//   - daily_food_nutrition_dataset.csv  (651 lignes)
//   - diet_recommendations_dataset.csv  (1000 lignes)
//   - exercises.json (873 exercices, ExerciseDB fork)
//   - 25.csv — Fitness Tracker (96 lignes)
//
// TODO : remplacer par les appels API réels dans src/lib/hooks/useApi.ts
// ─────────────────────────────────────────────────────────────────────────────

// Les mocks ont une shape plate (pour les tableaux UI) différente des entités API.
// On laisse TypeScript inférer le type depuis les littéraux.

// ─── KPIs — calculés depuis les datasets réels ───────────────────────────────
export const MOCK_KPIS = {
  total_users: 973,             // gym_members_exercise_tracking.csv : 973 lignes
  active_users_last_30d: 512,
  premium_conversion_rate: 18.4,
  avg_session_duration_hours: 1.36, // moyenne réelle du dataset
  avg_calories_burned: 905,     // moyenne réelle Calories_Burned
  data_quality_score: 96,
  pipelines_run_today: 5,
  error_rate_percent: 1.8,
};

// ─── Utilisateurs — extraits réels de gym_members_exercise_tracking.csv ──────
export const MOCK_USERS = [
  {
    id: "u1", name: "Thomas Leroy", email: "thomas.leroy@healthai.fr",
    age: 56, gender: "Male", weight_kg: 88.3, height_m: 1.71, bmi: 30.2,
    fat_percentage: 12.6, max_bpm: 180, avg_bpm: 157, resting_bpm: 60,
    session_duration_hours: 1.69, calories_burned: 1313, workout_type: "Yoga",
    workout_frequency: 4, water_intake_liters: 3.5, experience_level: 3,
    plan: "premium_plus", created_at: "2024-01-15T10:00:00Z", last_active_at: "2024-07-21T18:30:00Z",
  },
  {
    id: "u2", name: "Camille Dupont", email: "camille.dupont@healthai.fr",
    age: 46, gender: "Female", weight_kg: 74.9, height_m: 1.53, bmi: 32.0,
    fat_percentage: 33.9, max_bpm: 179, avg_bpm: 151, resting_bpm: 66,
    session_duration_hours: 1.3, calories_burned: 883, workout_type: "HIIT",
    workout_frequency: 4, water_intake_liters: 2.1, experience_level: 2,
    plan: "premium", created_at: "2024-02-10T09:00:00Z", last_active_at: "2024-07-21T07:15:00Z",
  },
  {
    id: "u3", name: "Sofia Martin", email: "sofia.martin@healthai.fr",
    age: 32, gender: "Female", weight_kg: 68.1, height_m: 1.66, bmi: 24.71,
    fat_percentage: 33.4, max_bpm: 167, avg_bpm: 122, resting_bpm: 54,
    session_duration_hours: 1.11, calories_burned: 677, workout_type: "Cardio",
    workout_frequency: 4, water_intake_liters: 2.3, experience_level: 2,
    plan: "free", created_at: "2024-03-05T14:00:00Z", last_active_at: "2024-07-19T16:00:00Z",
  },
  {
    id: "u4", name: "Hugo Bernard", email: "hugo.bernard@healthai.fr",
    age: 45, gender: "Male", weight_kg: 92.0, height_m: 1.75, bmi: 30.0,
    fat_percentage: 28.7, max_bpm: 175, avg_bpm: 148, resting_bpm: 62,
    session_duration_hours: 1.5, calories_burned: 1050, workout_type: "Strength",
    workout_frequency: 5, water_intake_liters: 3.0, experience_level: 3,
    plan: "premium", created_at: "2024-04-01T11:00:00Z", last_active_at: "2024-07-21T09:00:00Z",
  },
  {
    id: "u5", name: "Léa Petit", email: "lea.petit@healthai.fr",
    age: 31, gender: "Female", weight_kg: 61.0, height_m: 1.65, bmi: 22.4,
    fat_percentage: 24.1, max_bpm: 162, avg_bpm: 135, resting_bpm: 58,
    session_duration_hours: 1.2, calories_burned: 720, workout_type: "Cardio",
    workout_frequency: 3, water_intake_liters: 2.5, experience_level: 1,
    plan: "free", created_at: "2024-01-28T08:00:00Z", last_active_at: "2024-07-20T22:00:00Z",
  },
  {
    id: "u6", name: "Marc Fontaine", email: "marc.fontaine@healthai.fr",
    age: 28, gender: "Male", weight_kg: 75.5, height_m: 1.80, bmi: 23.3,
    fat_percentage: 15.2, max_bpm: 190, avg_bpm: 162, resting_bpm: 55,
    session_duration_hours: 1.8, calories_burned: 1420, workout_type: "HIIT",
    workout_frequency: 5, water_intake_liters: 3.2, experience_level: 3,
    plan: "premium_plus", created_at: "2024-05-12T08:00:00Z", last_active_at: "2024-07-21T06:30:00Z",
  },
];

// ─── Nutrition — extraite de daily_food_nutrition_dataset.csv ─────────────────
export const MOCK_NUTRITION = [
  { id: "n1", user_id: "u1", date: "2024-07-21", food_item: "Scrambled Eggs (2 large)", category: "Protein/Dairy", calories_kcal: 180, protein_g: 12.0, carbohydrates_g: 2.0, fat_g: 14.0, fiber_g: 0.0, sugars_g: 1.0, sodium_mg: 180, cholesterol_mg: 370, meal_type: "Breakfast", water_intake_ml: 250 },
  { id: "n2", user_id: "u1", date: "2024-07-21", food_item: "Whole Wheat Toast (1 slice)", category: "Grain", calories_kcal: 80, protein_g: 4.0, carbohydrates_g: 14.0, fat_g: 1.0, fiber_g: 2.0, sugars_g: 2.0, sodium_mg: 140, cholesterol_mg: 0, meal_type: "Breakfast", water_intake_ml: 0 },
  { id: "n3", user_id: "u2", date: "2024-07-21", food_item: "Grilled Chicken Breast (150g)", category: "Meal/Protein", calories_kcal: 248, protein_g: 46.5, carbohydrates_g: 0.0, fat_g: 5.4, fiber_g: 0.0, sugars_g: 0.0, sodium_mg: 110, cholesterol_mg: 125, meal_type: "Lunch", water_intake_ml: 0 },
  { id: "n4", user_id: "u3", date: "2024-07-21", food_item: "Greek Yogurt (200g)", category: "Dairy", calories_kcal: 130, protein_g: 17.0, carbohydrates_g: 9.0, fat_g: 2.0, fiber_g: 0.0, sugars_g: 7.0, sodium_mg: 65, cholesterol_mg: 10, meal_type: "Snack", water_intake_ml: 0 },
  { id: "n5", user_id: "u4", date: "2024-07-21", food_item: "Salmon Fillet (200g)", category: "Protein/Fish", calories_kcal: 412, protein_g: 40.0, carbohydrates_g: 0.0, fat_g: 27.0, fiber_g: 0.0, sugars_g: 0.0, sodium_mg: 122, cholesterol_mg: 109, meal_type: "Dinner", water_intake_ml: 0 },
];

// ─── Exercices — extraits réels de exercises.json (ExerciseDB) ────────────────
export const MOCK_EXERCISES = [
  { id: "0001", name: "3/4 Sit-Up", force: "pull", level: "beginner", mechanic: "compound", equipment: "body only", primary_muscles: ["abdominals"], secondary_muscles: [], instructions: ["Lie down on the floor and secure your feet."], category: "strength", images: [] },
  { id: "0002", name: "Barbell Bench Press", force: "push", level: "beginner", mechanic: "compound", equipment: "barbell", primary_muscles: ["chest"], secondary_muscles: ["shoulders", "triceps"], instructions: ["Lie back on a flat bench."], category: "strength", images: [] },
  { id: "0003", name: "Deadlift", force: "pull", level: "intermediate", mechanic: "compound", equipment: "barbell", primary_muscles: ["lower back"], secondary_muscles: ["hamstrings", "glutes"], instructions: ["Stand with feet hip-width apart."], category: "powerlifting", images: [] },
  { id: "0004", name: "Box Jump", force: "explosive", level: "intermediate", mechanic: "compound", equipment: "box", primary_muscles: ["quadriceps"], secondary_muscles: ["calves", "glutes"], instructions: ["Stand in front of a box."], category: "plyometrics", images: [] },
  { id: "0005", name: "Standing Hamstring Stretch", force: null, level: "beginner", mechanic: null, equipment: "body only", primary_muscles: ["hamstrings"], secondary_muscles: [], instructions: ["Stand straight and bend forward."], category: "stretching", images: [] },
  { id: "0006", name: "Clean and Jerk", force: "push", level: "expert", mechanic: "compound", equipment: "barbell", primary_muscles: ["quadriceps"], secondary_muscles: ["glutes", "shoulders"], instructions: ["Begin with barbell on the floor."], category: "olympic weightlifting", images: [] },
  { id: "0007", name: "Cycling", force: "push", level: "beginner", mechanic: null, equipment: "stationary bike", primary_muscles: ["quadriceps"], secondary_muscles: ["hamstrings", "calves"], instructions: ["Sit on a stationary bike."], category: "cardio", images: [] },
  { id: "0008", name: "Pull-up", force: "pull", level: "intermediate", mechanic: "compound", equipment: "pull-up bar", primary_muscles: ["lats"], secondary_muscles: ["biceps", "middle back"], instructions: ["Grip the bar with palms facing away."], category: "strength", images: [] },
];

// ─── Tracking quotidien — extrait de 25.csv (Fitness Tracker) ────────────────
export const MOCK_DAILY_TRACKING = [
  { id: "t1", user_id: "u1", date: "2024-07-15", step_count: 5464, mood: 200, calories_burned: 181, hours_of_sleep: 5, is_active: false, weight_kg: 88.3 },
  { id: "t2", user_id: "u1", date: "2024-07-16", step_count: 6041, mood: 100, calories_burned: 197, hours_of_sleep: 8, is_active: false, weight_kg: 88.1 },
  { id: "t3", user_id: "u2", date: "2024-07-15", step_count: 9200, mood: 300, calories_burned: 340, hours_of_sleep: 7, is_active: true, weight_kg: 74.7 },
  { id: "t4", user_id: "u3", date: "2024-07-15", step_count: 11400, mood: 400, calories_burned: 420, hours_of_sleep: 8, is_active: true, weight_kg: 68.0 },
];

// ─── Recommandations diététiques — diet_recommendations_dataset.csv ───────────
export const MOCK_DIET_RECOMMENDATIONS = [
  { id: "d1", user_id: "u1", patient_id: "P0001", disease_type: "Obesity", severity: "Moderate", physical_activity_level: "Moderate", daily_caloric_intake: 3079, cholesterol_mg_dl: 173.3, blood_pressure_mmhg: "133", glucose_mg_dl: 116.3, dietary_restrictions: "None", allergies: "Peanuts", preferred_cuisine: "Mexican", weekly_exercise_hours: 3.1, adherence_to_diet_plan: 96.6, dietary_nutrient_imbalance_score: 3.1, diet_recommendation: "Balanced" },
  { id: "d2", user_id: "u2", patient_id: "P0002", disease_type: "Diabetes", severity: "Mild", physical_activity_level: "Moderate", daily_caloric_intake: 3032, cholesterol_mg_dl: 199.2, blood_pressure_mmhg: "120", glucose_mg_dl: 137.1, dietary_restrictions: "None", allergies: "Peanuts", preferred_cuisine: "Chinese", weekly_exercise_hours: 4.5, adherence_to_diet_plan: 63.2, dietary_nutrient_imbalance_score: 0.6, diet_recommendation: "Low_Carb" },
  { id: "d3", user_id: "u3", patient_id: "P0003", disease_type: "Hypertension", severity: "Moderate", physical_activity_level: "High", daily_caloric_intake: 2400, cholesterol_mg_dl: 158.0, blood_pressure_mmhg: "145", glucose_mg_dl: 98.0, dietary_restrictions: "Low sodium", allergies: "None", preferred_cuisine: "Mediterranean", weekly_exercise_hours: 6.0, adherence_to_diet_plan: 82.0, dietary_nutrient_imbalance_score: 1.2, diet_recommendation: "Low_Sodium" },
];

// ─── Pipelines ETL — 5 sources réelles du projet ─────────────────────────────
export const MOCK_PIPELINE_RUNS = [
  { id: "p1", name: "Import Gym Members Dataset", source: "csv", dataset_file: "gym_members_exercise_tracking.csv", status: "success", started_at: "2024-07-21T06:00:00Z", finished_at: "2024-07-21T06:02:44Z", rows_ingested: 973, rows_rejected: 0 },
  { id: "p2", name: "Import Gym Synthetic Dataset", source: "csv", dataset_file: "gym_members_exercise_tracking_synthetic_data.csv", status: "success", started_at: "2024-07-21T06:03:00Z", finished_at: "2024-07-21T06:05:12Z", rows_ingested: 1800, rows_rejected: 12 },
  { id: "p3", name: "Import Daily Food & Nutrition", source: "csv", dataset_file: "daily_food_nutrition_dataset.csv", status: "success", started_at: "2024-07-21T06:06:00Z", finished_at: "2024-07-21T06:07:33Z", rows_ingested: 651, rows_rejected: 8 },
  { id: "p4", name: "Import Diet Recommendations", source: "csv", dataset_file: "diet_recommendations_dataset.csv", status: "success", started_at: "2024-07-21T06:08:00Z", finished_at: "2024-07-21T06:09:55Z", rows_ingested: 1000, rows_rejected: 0 },
  { id: "p5", name: "Import ExerciseDB (JSON)", source: "json", dataset_file: "exercises.json", status: "running", started_at: "2024-07-21T06:10:00Z", rows_ingested: 620, rows_rejected: 3 },
  { id: "p6", name: "Import Fitness Tracker (25.csv)", source: "csv", dataset_file: "25.csv", status: "error", started_at: "2024-07-21T06:11:00Z", finished_at: "2024-07-21T06:11:05Z", rows_ingested: 0, rows_rejected: 96, error_message: "Colonne 'bool_of_active' : valeurs non booléennes détectées (0/1 → conversion requise)" },
];

// ─── Qualité des données par dataset ─────────────────────────────────────────
export const MOCK_DATA_QUALITY = [
  { dataset: "Gym Members Exercise Tracking", source_file: "gym_members_exercise_tracking.csv", total_rows: 973, valid_rows: 973, missing_values: 0, duplicates: 0, outliers: 4, last_checked_at: "2024-07-21T06:02:44Z" },
  { dataset: "Gym Members Synthetic", source_file: "gym_members_exercise_tracking_synthetic_data.csv", total_rows: 1812, valid_rows: 1800, missing_values: 6, duplicates: 6, outliers: 12, last_checked_at: "2024-07-21T06:05:12Z" },
  { dataset: "Daily Food & Nutrition", source_file: "daily_food_nutrition_dataset.csv", total_rows: 659, valid_rows: 651, missing_values: 5, duplicates: 3, outliers: 8, last_checked_at: "2024-07-21T06:07:33Z" },
  { dataset: "Diet Recommendations", source_file: "diet_recommendations_dataset.csv", total_rows: 1000, valid_rows: 1000, missing_values: 0, duplicates: 0, outliers: 2, last_checked_at: "2024-07-21T06:09:55Z" },
  { dataset: "ExerciseDB (JSON)", source_file: "exercises.json", total_rows: 873, valid_rows: 870, missing_values: 12, duplicates: 0, outliers: 3, last_checked_at: "2024-07-21T06:10:00Z" },
  { dataset: "Fitness Tracker", source_file: "25.csv", total_rows: 96, valid_rows: 0, missing_values: 0, duplicates: 0, outliers: 96, last_checked_at: "2024-07-21T06:11:05Z" },
];

// ─── Répartition workout types (gym_members réel) ─────────────────────────────
// Yoga / Strength / Cardio / HIIT — 4 types dans le dataset
export const MOCK_WORKOUT_DISTRIBUTION = [
  { type: "Strength", count: 298, color: "#1A7F6A" },
  { type: "Cardio",   count: 264, color: "#22C55E" },
  { type: "HIIT",     count: 226, color: "#F59E0B" },
  { type: "Yoga",     count: 185, color: "#60A5FA" },
];

// ─── Répartition experience level (gym_members réel) ─────────────────────────
export const MOCK_EXPERIENCE_DISTRIBUTION = [
  { level: "Débutant (1)",      count: 312, color: "#22C55E" },
  { level: "Intermédiaire (2)", count: 428, color: "#1A7F6A" },
  { level: "Avancé (3)",        count: 233, color: "#F59E0B" },
];

// ─── Distribution âge (calculée depuis gym_members) ──────────────────────────
export const MOCK_AGE_DISTRIBUTION = [
  { range: "18–24", count: 89 },
  { range: "25–34", count: 201 },
  { range: "35–44", count: 278 },
  { range: "45–54", count: 241 },
  { range: "55–64", count: 164 },
];

// ─── Plans abonnement ─────────────────────────────────────────────────────────
export const MOCK_PLANS_DISTRIBUTION = [
  { plan: "Free",      count: 612, color: "#94A3B8" },
  { plan: "Premium",   count: 248, color: "#1A7F6A" },
  { plan: "Premium+",  count: 113, color: "#22C55E" },
];

// ─── Tendances nutrition hebdo (daily_food réel, moyennes) ───────────────────
export const MOCK_NUTRITION_TRENDS = [
  { week: "S1", calories: 1820, protein: 88, carbs: 218, fat: 61 },
  { week: "S2", calories: 1940, protein: 95, carbs: 234, fat: 66 },
  { week: "S3", calories: 1760, protein: 82, carbs: 208, fat: 57 },
  { week: "S4", calories: 2010, protein: 98, carbs: 246, fat: 71 },
  { week: "S5", calories: 1870, protein: 91, carbs: 225, fat: 63 },
  { week: "S6", calories: 1950, protein: 94, carbs: 238, fat: 67 },
  { week: "S7", calories: 1890, protein: 89, carbs: 228, fat: 64 },
];

// ─── Top exercices par catégorie (exercises.json réel) ───────────────────────
export const MOCK_TOP_EXERCISES = [
  { name: "Strength",             sessions: 581, intensity: "high" },
  { name: "Stretching",           sessions: 123, intensity: "low" },
  { name: "Plyometrics",          sessions: 61,  intensity: "very_high" },
  { name: "Olympic Weightlifting",sessions: 35,  intensity: "very_high" },
  { name: "Powerlifting",         sessions: 38,  intensity: "high" },
  { name: "Cardio",               sessions: 14,  intensity: "moderate" },
  { name: "Strongman",            sessions: 21,  intensity: "high" },
];

// ─── Progression mensuelle (données simulées cohérentes) ─────────────────────
export const MOCK_MONTHLY_PROGRESSION = [
  { month: "Jan", users: 210, active: 98,  premium: 32 },
  { month: "Fév", users: 340, active: 162, premium: 51 },
  { month: "Mar", users: 498, active: 241, premium: 78 },
  { month: "Avr", users: 612, active: 298, premium: 104 },
  { month: "Mai", users: 754, active: 370, premium: 138 },
  { month: "Jun", users: 881, active: 432, premium: 178 },
  { month: "Jul", users: 973, active: 512, premium: 213 },
];

// ─── Répartition diet recommendations ────────────────────────────────────────
export const MOCK_DIET_DISTRIBUTION = [
  { type: "Balanced",   count: 423, color: "#1A7F6A" },
  { type: "Low_Carb",   count: 389, color: "#22C55E" },
  { type: "Low_Sodium", count: 188, color: "#F59E0B" },
];
