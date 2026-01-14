import { StoreState } from "../types";

/**
 * Cloudflare Pages + Functions wrapper.
 * - No API keys in the browser.
 * - Backend (Pages Function) calls Workers AI on the Free plan (10,000 neurons/day).
 */
export const getAIStoreAdvice = async (state: StoreState, userQuery?: string): Promise<string> => {
  const res = await fetch("/api/store-advice", {
    method: "POST",
    headers: { "content-type": "application/json", "x-client-id": getClientId() },
    body: JSON.stringify({ state, userQuery }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI request failed: ${res.status} ${text}`);
  }

  const data = await res.json().catch(() => ({} as any));
  return data?.answer ?? "No pude procesar eso.";
};

// Not currently used by the UI. Left as a safe stub for now.
export const analyzeProductImage = async () => {
  return { match: null, reason: "Función no habilitada en el despliegue gratuito." };
};
