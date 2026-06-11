import { API_URLS, authHeaders, authHeadersMultipart } from "./api.config";

const VISION = API_URLS.vision;

export function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return val.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export async function analyzePhoto(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${VISION}/analyze`, {
    method: "POST",
    headers: await authHeadersMultipart(),
    body: form,
  });
  if (!res.ok) throw new Error("Échec de l'analyse photo");
  return res.json();
}

export async function requestAdvice(consumptionId: string) {
  const res = await fetch(`${VISION}/nutrition/ai/advice`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ consumption_id: consumptionId }),
  });
  if (!res.ok) throw new Error("Échec du déclenchement IA");
  return res.json();
}

export async function getConsumption(consumptionId: string) {
  const res = await fetch(`${VISION}/nutrition/consumption/${consumptionId}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Échec du polling");
  return res.json();
}

export async function requestSuggestion() {
  const res = await fetch(`${VISION}/nutrition/ai/suggest-meal`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Échec de la suggestion");
  return res.json();
}

export async function getSuggestion(suggestionId: string) {
  const res = await fetch(`${VISION}/nutrition/suggestion/${suggestionId}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Échec du polling suggestion");
  return res.json();
}

export async function validateSuggestion(suggestionId: string) {
  const res = await fetch(`${VISION}/nutrition/ai/validate-suggestion`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ suggestion_id: suggestionId }),
  });
  if (!res.ok) throw new Error("Échec de la validation");
  return res.json();
}

export async function pollUntilDone<T extends { status: string }>(
  fn: () => Promise<T>,
  intervalMs = 2500,
  maxAttempts = 30
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await fn();
    if (result.status === "completed" || result.status === "failed") return result;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Timeout — l'IA n'a pas répondu à temps");
}