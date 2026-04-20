"use client";

import { useRef, useState } from "react";
import { Upload, FileText, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// ─── Types ────────────────────────────────────────────────────────────────────

const PIPELINE_OPTIONS = [
  { value: "aliments",                   label: "Aliments (daily_food_nutrition_dataset.csv)",         accept: ".csv" },
  { value: "exercices",                  label: "Exercices (exercises.json)",                           accept: ".json,.csv" },
  { value: "recommendations",            label: "Recommandations (diet_recommendations_dataset.csv)",  accept: ".csv" },
  { value: "historique_seance",          label: "Historique séances (csv)",                            accept: ".csv" },
  { value: "historique_seance_synthetic",label: "Historique séances synthétique (csv)",                accept: ".csv" },
] as const;

type PipelineType = typeof PIPELINE_OPTIONS[number]["value"];

// ─── Composant ────────────────────────────────────────────────────────────────

export function ImportCsvSection() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [pipeline, setPipeline]       = useState<PipelineType>("aliments");
  const [dragging, setDragging]       = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading]         = useState(false);

  const selectedOption = PIPELINE_OPTIONS.find((o) => o.value === pipeline)!;

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const allowed = selectedOption.accept.split(",").map((a) => a.replace(".", ""));
    if (!ext || !allowed.includes(ext)) {
      toast("error", `Format invalide. Attendu : ${selectedOption.accept}`);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", selectedFile);
      const FASTAPI = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";
      const res = await fetch(`${FASTAPI}/upload/${pipeline}`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      toast("success", `Pipeline «${pipeline}» lancé · fichier : ${data.file}`);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: unknown) {
      toast("error", err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" aria-hidden="true" />
          <CardTitle>Importer un fichier</CardTitle>
        </div>
        <CardDescription>
          Sélectionnez le type de pipeline, déposez votre fichier, puis cliquez sur Envoyer.
          L&apos;ETL le traitera en arrière-plan et mettra à jour la BDD.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Sélecteur pipeline */}
        <div>
          <label htmlFor="pipeline-select" className="text-sm font-medium text-foreground">
            Type de pipeline
          </label>
          <div className="relative mt-1 w-full max-w-sm">
            <select
              id="pipeline-select"
              value={pipeline}
              onChange={(e) => { setPipeline(e.target.value as PipelineType); setSelectedFile(null); }}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {PIPELINE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Formats acceptés : <span className="font-mono">{selectedOption.accept}</span>
          </p>
        </div>

        {/* Zone drag & drop */}
        <div
          role="region"
          aria-label="Zone de dépôt de fichier"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer
            ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
        >
          <FileText className={`h-8 w-8 ${dragging ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
          {selectedFile ? (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} Ko</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Glissez un fichier ici</p>
              <p className="text-xs text-muted-foreground">ou cliquez pour parcourir</p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={selectedOption.accept}
            className="hidden"
            aria-label="Sélectionner un fichier"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary" size="sm" icon={Upload}
            loading={loading}
            disabled={!selectedFile || loading}
            onClick={handleSubmit}
            aria-label="Envoyer le fichier vers l'ETL"
          >
            Envoyer vers l&apos;ETL
          </Button>
          {selectedFile && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
              Annuler
            </Button>
          )}
        </div>

        {/* Info workflow */}
        <p className="text-xs text-muted-foreground rounded-lg border border-border bg-muted/40 px-3 py-2">
          <strong>Workflow :</strong> Upload → Pipeline ETL (nettoyage + validation) → Ingestion BDD PostgreSQL → données disponibles dans les onglets ci-dessus
        </p>

      </CardContent>
    </Card>
  );
}