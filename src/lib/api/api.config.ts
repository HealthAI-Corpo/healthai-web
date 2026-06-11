import { getToken } from "@/lib/hooks/useAuth";

const GATEWAY = process.env.NEXT_PUBLIC_AI_GATEWAY_URL ?? "http://localhost:8003";

export const API_URLS = {
  vision: `${GATEWAY}/vision`,
  workout: `${GATEWAY}/workout`,
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
