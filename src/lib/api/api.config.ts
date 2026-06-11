const GATEWAY = process.env.NEXT_PUBLIC_AI_GATEWAY_URL ?? "http://localhost:8003";

export const API_URLS = {
  vision:  `${GATEWAY}/vision`,
  workout: `${GATEWAY}/workout`,
};

export async function authHeaders(): Promise<Record<string, string>> {
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  return {
    "Authorization": `Bearer ${(session as { accessToken?: string })?.accessToken ?? "dev-token"}`,
    "Content-Type": "application/json",
  };
}

export async function authHeadersMultipart(): Promise<Record<string, string>> {
  const { getSession } = await import("next-auth/react");
  const session = await getSession();
  return {
    "Authorization": `Bearer ${(session as { accessToken?: string })?.accessToken ?? "dev-token"}`,
  };
}