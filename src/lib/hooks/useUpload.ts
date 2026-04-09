// Upload de fichiers CSV/JSON vers FastAPI ETL
// POST /upload → sauvegarde dans data/raw/ côté ETL
// puis (quand TODO M1 sera fait) déclenche le pipeline automatiquement

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";

const ETL_URL = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000";

// envoie un fichier brut vers l'ETL FastAPI
export async function uploadFichier(fichier: File): Promise<{ saved: string; size: number }> {
  const form = new FormData();
  form.append("file", fichier);

  const res = await fetch(`${ETL_URL}/upload`, {
    method: "POST",
    body: form,
    // pas de Content-Type ici — le navigateur le met automatiquement avec le boundary
  });

  if (!res.ok) throw new Error(`Upload échoué (${res.status})`);
  return res.json();
}

// reconstruit un CSV depuis un tableau d'objets et l'envoie à l'ETL
// utile quand on modifie des lignes dans l'interface puis qu'on veut repousser vers l'ETL
export async function pousserCsvVersEtl(
  donnees: Record<string, unknown>[],
  nomFichier: string,
): Promise<void> {
  if (!donnees.length) throw new Error("Aucune donnée à envoyer");

  const csvStr = Papa.unparse(donnees);
  const blob = new Blob([csvStr], { type: "text/csv" });
  const fichier = new File([blob], nomFichier, { type: "text/csv" });

  await uploadFichier(fichier);
}

// hook React pour l'upload avec gestion état loading/erreur
export function useUploadDataset() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ fichier }: { fichier: File }) => uploadFichier(fichier),
    onSuccess: () => {
      // invalide les caches pour forcer un rechargement des données
      qc.invalidateQueries({ queryKey: ["pipeline-runs"] });
      qc.invalidateQueries({ queryKey: ["data-quality"] });
    },
  });
}

// hook pour repousser un dataset modifié vers l'ETL
export function usePousserDataset() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      donnees,
      nomFichier,
    }: {
      donnees: Record<string, unknown>[];
      nomFichier: string;
    }) => pousserCsvVersEtl(donnees, nomFichier),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipeline-runs"] });
      qc.invalidateQueries({ queryKey: ["data-quality"] });
    },
  });
}
