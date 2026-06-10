"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { Upload, Sparkles, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/Card";
import { MetabaseEmbed } from "@/app/(dashboard)/analytics/components/metabaseEmbed";
import { analyzePhoto, requestAdvice, getConsumption, requestSuggestion, getSuggestion, validateSuggestion, pollUntilDone,} from "@/lib/api/nutrition";

// Mock — remplacer par useSession() en prod
const USER_ID = 1;
const MB = { macros: 2 };

// ── Types ─────────────────────────────────────────────────────────────────────

interface MacroResult {
  consumption_id: string;
  detections: { name: string; confidence: number }[];
  total_repas: {
    calories: number;
    proteines: number;
    glucides: number;
    lipides: number;
    eau_ml: number;
  };
}

interface AdviceResult {
  bilan_macros: string;
  conseils_sante: string;
  error?: string;
}

interface SuggestionResult {
  suggestion_id: string;
  titre_repas: string;
  estimation_calories: string;
  ingredients: string[];
  instructions: string[];
}

// ── Composant Upload photo ────────────────────────────────────────────────────

const MAX_SIZE_MB = 25;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function MealPhotoUpload({
  onFile,
  loading,
}: {
  onFile: (file: File) => void;
  loading: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handle = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Format non supporté. Utilisez JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
      return;
    }
    setUploadError(null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    onFile(file);
  };

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) handle(f);
        }}
        onClick={() => ref.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Déposer ou sélectionner une photo de repas"
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={ref}
          type="file"
          accept={ALLOWED_TYPES.join(",")}   // cohérent avec la validation
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
            // Reset pour permettre re-sélection du même fichier
            e.target.value = "";
          }}
          aria-label="Sélectionner une photo de repas"
        />

        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob: URL locale, Image() non compatible
          <img
            src={preview}
            alt="Aperçu du repas sélectionné"
            className="max-h-48 rounded-lg object-cover"
          />
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Glissez une photo ou cliquez pour parcourir
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WEBP — max {MAX_SIZE_MB} Mo
              </p>
            </div>
          </>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Sparkles className="h-4 w-4 animate-pulse" aria-hidden="true" />
              Analyse en cours…
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <p role="alert" className="text-sm text-destructive mt-2">
          {uploadError}
        </p>
      )}
    </>
  );
}
// ── Page principale ───────────────────────────────────────────────────────────

export default function NutritionPage() {

  // Analyse photo
  const [photoLoading, setPhotoLoading] = useState(false);
  const [macroResult, setMacroResult] = useState<MacroResult | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Conseil IA
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [advice, setAdvice] = useState<AdviceResult | null>(null);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  // Suggestion repas
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);
  const [suggError, setSuggError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  // ── Analyse photo ──────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    setPhotoLoading(true);
    setPhotoError(null);
    setMacroResult(null);
    setAdvice(null);
    try {
      const result = await analyzePhoto(file);
      setMacroResult(result);
    } catch {
      setPhotoError("L'analyse a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setPhotoLoading(false);
    }
  }, []);

  // ── Conseil IA ─────────────────────────────────────────────────────────────

  const handleAdvice = useCallback(async () => {
    if (!macroResult) return;
    setAdviceLoading(true);
    setAdviceError(null);
    setAdvice(null);
    try {
      await requestAdvice(macroResult.consumption_id);
      const result = await pollUntilDone(
        () => getConsumption(macroResult.consumption_id)
      );
      if (result.recommandation_ia?.error) {
        setAdviceError(result.recommandation_ia.error);
      } else if (result.recommandation_ia) {
        setAdvice(result.recommandation_ia);
      }
    } catch (e: unknown) {
      setAdviceError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setAdviceLoading(false);
    }
  }, [macroResult]);

  // ── Suggestion repas ───────────────────────────────────────────────────────

  const handleSuggest = useCallback(async () => {
    setSuggLoading(true);
    setSuggError(null);
    setSuggestion(null);
    setValidated(false);
    try {
      const { suggestion_id } = await requestSuggestion();
      const result = await pollUntilDone(
        () => getSuggestion(suggestion_id)
      );
      if (result.suggestion?.error) {
        setSuggError(result.suggestion.error);
      } else if (result.resultat) {
        setSuggestion({ suggestion_id, ...result.resultat });
      }
    } catch (e: unknown) {
      setSuggError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setSuggLoading(false);
    }
  }, []);

  // ── Validation suggestion ──────────────────────────────────────────────────

  const handleValidate = useCallback(async () => {
    if (!suggestion) return;
    setValidating(true);
    try {
      await validateSuggestion(suggestion.suggestion_id);
      setValidated(true);
    } catch {
      setSuggError("La validation a échoué. Réessayez.");
    } finally {
      setValidating(false);
    }
  }, [suggestion]);

  return (
    <div className="flex flex-col gap-0">
      <PageHeader
        title="Nutrition"
        description="Analysez vos repas par photo et obtenez des conseils personnalisés par IA"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ── Analyse photo ── */}
          <section aria-labelledby="meal-title">
            <Card>
              <CardHeader>
                <CardTitle id="meal-title">Analyser un repas</CardTitle>
                <CardDescription>
                  Photo → détection YOLO → macros automatiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MealPhotoUpload onFile={handleFile} loading={photoLoading} />

                {photoError && (
                  <p role="alert" className="text-sm text-destructive">{photoError}</p>
                )}

                {macroResult && (
                  <div className="space-y-3" role="region" aria-label="Résultat analyse photo" aria-live="polite">

                    {/* Aliments détectés */}
                    <div className="rounded-xl border border-border bg-muted/30 p-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Aliments détectés
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {macroResult.detections.map((d) => (
                          <span key={d.name} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
                            {d.name} ({Math.round(d.confidence * 100)}%)
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { label: "Calories",  value: `${macroResult.total_repas.calories} kcal` },
                        { label: "Protéines", value: `${macroResult.total_repas.proteines}g` },
                        { label: "Glucides",  value: `${macroResult.total_repas.glucides}g` },
                        { label: "Lipides",   value: `${macroResult.total_repas.lipides}g` },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-lg border border-border bg-card p-3 text-center">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Bouton conseil IA */}
                    {!advice && (
                      <button
                        type="button"
                        onClick={handleAdvice}
                        disabled={adviceLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-busy={adviceLoading}
                      >
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        {adviceLoading ? "L'IA analyse votre profil…" : "Demander l'avis de l'IA"}
                      </button>
                    )}

                    {adviceError && (
                      <p role="alert" className="text-sm text-destructive">{adviceError}</p>
                    )}

                    {/* Conseil IA */}
                    {advice && (
                      <div
                        className="rounded-xl border border-success/20 bg-success/5 p-4 space-y-2"
                        role="region"
                        aria-label="Conseils nutritionnels IA"
                        aria-live="polite"
                      >
                        <p className="text-xs font-semibold text-success uppercase tracking-wide">Bilan</p>
                        <p className="text-sm text-foreground leading-relaxed">{advice.bilan_macros}</p>
                        <p className="text-xs font-semibold text-success uppercase tracking-wide mt-2">Conseils</p>
                        <p className="text-sm text-foreground leading-relaxed">{advice.conseils_sante}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ── Suggestion de repas ── */}
          <section aria-labelledby="suggest-title">
            <Card>
              <CardHeader>
                <CardTitle id="suggest-title">Idée de repas</CardTitle>
                <CardDescription>
                  L'IA vous propose une recette adaptée à vos calories restantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {!suggestion && !suggLoading && (
                  <button
                    type="button"
                    onClick={handleSuggest}
                    className="w-full rounded-lg border border-primary bg-primary/5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    ✨ Suggère-moi un repas
                  </button>
                )}

                {suggLoading && (
                  <div
                    className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"
                    aria-live="polite"
                    aria-busy="true"
                  >
                    <Sparkles className="h-4 w-4 animate-pulse text-primary" aria-hidden="true" />
                    L'IA prépare une suggestion…
                  </div>
                )}

                {suggError && (
                  <p role="alert" className="text-sm text-destructive">{suggError}</p>
                )}

                {suggestion && (
                  <div className="space-y-4" role="region" aria-label="Suggestion de repas" aria-live="polite">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-semibold text-foreground">{suggestion.titre_repas}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{suggestion.estimation_calories}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSuggest}
                        className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      >
                        Autre suggestion
                      </button>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Ingrédients
                      </p>
                      <ul className="space-y-1" aria-label="Liste des ingrédients">
                        {suggestion.ingredients.map((ing) => (
                          <li key={ing} className="flex items-center gap-2 text-sm text-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Instructions
                      </p>
                      <ol className="space-y-1.5" aria-label="Instructions de préparation">
                        {suggestion.instructions.map((step, i) => (
                          <li key={step} className="flex gap-2 text-sm text-foreground">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {validated ? (
                      <div
                        className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-2.5 text-sm text-success font-medium"
                        role="status"
                      >
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        Ajouté à votre journal quotidien !
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleValidate}
                        disabled={validating}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-busy={validating}
                      >
                        {validating ? "Enregistrement…" : "Enregistrer ce repas"}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Graphique Metabase */}
        <section aria-labelledby="nutrition-chart-title">
          <Card>
            <CardHeader>
              <CardTitle id="nutrition-chart-title">Évolution de votre nutrition</CardTitle>
              <CardDescription>Données Metabase · historique macronutriments</CardDescription>
            </CardHeader>
            <CardContent>
              <MetabaseEmbed dashboardId={MB.macros} height={300} />
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}