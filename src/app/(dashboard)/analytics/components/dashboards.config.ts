// ─── IDs des dashboards Metabase ─────────────────────────────────────────────
// Pour trouver l'ID : ouvre le dashboard dans Metabase → l'URL affiche /dashboard/X
// Remplace les valeurs ci-dessous par tes vrais IDs

export const DASHBOARDS = [
  {
    id: 3, // ← remplace par ton vrai ID
    title: "KPIs Business",
    description: "Conversion premium · répartition abonnements · genre · nouveaux utilisateurs",
    fallback: "subscriptions",
  },
  {
    id: 2, // ← remplace par ton vrai ID
    title: "Profils & Progression",
    description: "Niveau expérience · sports · poids · BPM · sommeil",
    fallback: "weight-trend",
  },
  {
    id: 4, // ← remplace par ton vrai ID
    title: "Analyse nutritionnelle",
    description: "Macronutriments · catégories · logs alimentaires",
    fallback: "meal-distribution",
  },
  {
    id: 5, // ← remplace par ton vrai ID
    title: "Statistiques fitness",
    description: "Exercices · séances · calories brûlées",
    fallback: "workout-history",
  },
  {
    id: 6, // ← remplace par ton vrai ID
    title: "Recommandations & Santé",
    description: "Régimes · pathologies · sévérité · adhérence",
    fallback: "diet-recommendations",
  },
  {
    id: 7, // ← remplace par ton vrai ID
    title: "Qualité ETL",
    description: "Anomalies · statuts pipelines · évolution qualité",
    fallback: "etl-quality",
  },
] as const;
