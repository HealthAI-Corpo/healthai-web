"use client";

import { useState, useCallback } from "react";
import { Sparkles, CheckCircle, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/Card";
import { MetabaseEmbed } from "@/app/(dashboard)/analytics/components/metabaseEmbed";
import { cn } from "@/lib/utils";
import {
  generateSession,
  getWorkoutRecommendation,
  explainExercises,
  type GeneratedSession,
  type Exercice,
} from "@/lib/api/workout";

const MB = { workout_history: 4 };

const WEEK_DAYS = [
  { name: "Lun", status: "done"    as const },
  { name: "Mar", status: "done"    as const },
  { name: "Mer", status: "done"    as const },
  { name: "Jeu", status: "rest"    as const },
  { name: "Ven", status: "planned" as const },
  { name: "Sam", status: "planned" as const },
  { name: "Dim", status: "rest"    as const },
];

const DAY_STYLES = {
  done:    { cell: "border-success/30 bg-success/5", label: "Fait",  emoji: "✅" },
  rest:    { cell: "bg-muted/30 border-muted",       label: "Repos", emoji: "😴" },
  planned: { cell: "border-border bg-background",    label: "Prévu", emoji: "🏋️" },
};

// ── Carte exercice ────────────────────────────────────────────────────────────

function ExerciceCard({
  ex,
  onExplain,
  explanation,
  explaining,
}: {
  ex: Exercice;
  onExplain: (ex: Exercice) => void;
  explanation?: string;
  explaining: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm text-foreground">{ex.nom}</p>
          {ex.muscles_cibles && (
            <p className="text-xs text-muted-foreground mt-0.5">{ex.muscles_cibles}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setOpen(!open); if (!open && !explanation) onExplain(ex); }}
          aria-label={`Voir explication de ${ex.nom}`}
          className="shrink-0 text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ex.series && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
            {ex.series} séries
          </span>
        )}
        {ex.repetitions && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
            {ex.repetitions} reps
          </span>
        )}
        {ex.repos_secondes && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
            {ex.repos_secondes}s repos
          </span>
        )}
      </div>

      {ex.conseil && (
        <p className="text-xs text-muted-foreground italic">💡 {ex.conseil}</p>
      )}

      {open && (
        <div className="mt-2 border-t border-border pt-2">
          {explaining && !explanation && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 animate-pulse text-primary" aria-hidden="true" />
              Chargement de l'explication…
            </p>
          )}
          {explanation && (
            <p className="text-xs text-foreground leading-relaxed">{explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function SportPage() {
  const [session, setSession] = useState<GeneratedSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explaining, setExplaining] = useState<string | null>(null);

  // ── Générer une séance ────────────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSession(null);
    setSaved(false);
    try {
      const result = await generateSession({}, false);
      setSession(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Recommandation ML + LLM ───────────────────────────────────────────────

  const handleRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSession(null);
    setSaved(false);
    try {
      const result = await getWorkoutRecommendation();
      if (result?.seance) setSession(result.seance);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Sauvegarder la séance ─────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await generateSession({}, true);
      setSaved(true);
    } catch {
      setError("Impossible de sauvegarder la séance.");
    } finally {
      setSaving(false);
    }
  }, []);

  // ── Explication exercice ──────────────────────────────────────────────────

  const handleExplain = useCallback(async (ex: Exercice) => {
    if (explanations[ex.nom]) return;
    setExplaining(ex.nom);
    try {
      const result = await explainExercises([ex]);
      const expl = result?.explications?.[0];
      if (expl) {
        setExplanations((prev) => ({
          ...prev,
          [ex.nom]: `${expl.technique} — Erreurs courantes : ${expl.erreurs_courantes.join(", ")}.`,
        }));
      }
    } catch {
      setExplanations((prev) => ({ ...prev, [ex.nom]: "Explication indisponible." }));
    } finally {
      setExplaining(null);
    }
  }, [explanations]);

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Entraînement"
        description="Générez un programme personnalisé par IA et suivez vos séances"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Coach sportif IA ── */}
          <section aria-labelledby="coach-title">
            <Card>
              <CardHeader>
                <CardTitle id="coach-title">Coach sportif IA</CardTitle>
                <CardDescription>
                  Générez une séance personnalisée selon votre profil et historique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    aria-busy={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {loading ? "L'IA génère votre séance…" : "Générer une séance IA"}
                  </button>
                  <button
                    type="button"
                    onClick={handleRecommendation}
                    disabled={loading}
                    className="w-full rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    🎯 Recommandation ML personnalisée
                  </button>
                </div>

                {loading && (
                  <div
                    className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <Sparkles className="h-4 w-4 animate-pulse text-primary" aria-hidden="true" />
                    L'IA construit votre programme…
                  </div>
                )}

                {error && (
                  <p role="alert" className="text-sm text-destructive">{error}</p>
                )}

                {session && (
                  <div className="space-y-4" role="region" aria-label="Séance générée" aria-live="polite">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <h3 className="font-display font-semibold text-foreground">{session.titre_seance}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          session.type_seance,
                          `${session.duree_minutes} min`,
                          session.difficulte,
                          session.objectif,
                        ].map((tag) => (
                          <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {session.conseils_generaux && (
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          {session.conseils_generaux}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {session.exercices.map((ex) => (
                        <ExerciceCard
                          key={ex.nom}
                          ex={ex}
                          onExplain={handleExplain}
                          explanation={explanations[ex.nom]}
                          explaining={explaining === ex.nom}
                        />
                      ))}
                    </div>

                    {saved ? (
                      <div
                        className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-2.5 text-sm text-success font-medium"
                        role="status"
                      >
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        Séance ajoutée à votre journal !
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        aria-busy={saving}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {saving ? "Enregistrement…" : "Enregistrer cette séance"}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ── Historique Metabase ── */}
          <section aria-labelledby="history-title">
            <Card>
              <CardHeader>
                <CardTitle id="history-title">Historique des séances</CardTitle>
                <CardDescription>Données Metabase · 5 dernières semaines</CardDescription>
              </CardHeader>
              <CardContent>
                <MetabaseEmbed
                  dashboardId={MB.workout_history}
                  height={300}
                  fallback="workout-history"
                />
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Planning semaine */}
        <section aria-labelledby="week-title">
          <Card>
            <CardHeader>
              <CardTitle id="week-title">Programme — semaine en cours</CardTitle>
              <CardDescription>Statut de chaque journée d'entraînement</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="grid grid-cols-7 gap-3"
                role="list"
                aria-label="Planning de la semaine"
              >
                {WEEK_DAYS.map(({ name, status }) => {
                  const styles = DAY_STYLES[status];
                  return (
                    <div
                      key={name}
                      role="listitem"
                      aria-label={`${name} : ${styles.label}`}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center",
                        styles.cell
                      )}
                    >
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {name}
                      </span>
                      <span className="text-lg" aria-hidden="true">{styles.emoji}</span>
                      <span className={cn(
                        "text-[10px]",
                        status === "done" ? "text-success font-medium" : "text-muted-foreground"
                      )}>
                        {styles.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
