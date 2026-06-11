import { getToken } from "@/lib/hooks/useAuth";

export const API_URLS = {
  vision: process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000/vision",
  workout: process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8000/workout",
};

export async function authHeaders(): Promise<Record<string, string>> {
  return {
    "Authorization": `Bearer ${getToken() ?? "dev-token"}`,
    "Content-Type": "application/json",
  };
}

export async function authHeadersMultipart(): Promise<Record<string, string>> {
  return {
    "Authorization": `Bearer ${getToken() ?? "dev-token"}`,
  };
}
