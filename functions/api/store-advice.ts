export interface Env {
  AI: Ai;
}

/**
 * POST /api/store-advice
 * Body: { state: StoreState, userQuery?: string }
 * Returns: { answer: string }
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, waitUntil } = context;

  // --- Basic anti-abuse guard (client id from the browser) ---
  const clientId = request.headers.get("x-client-id") || "";
  if (clientId.length < 10) {
    return new Response("Missing x-client-id", { status: 400 });
  }

  let body: any;
  try {
    body = await request.json<any>();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  // Hard cap to avoid giant prompts (keeps neurons low).
  const raw = JSON.stringify(body);
  if (raw.length > 5000) {
    return new Response("Payload too large", { status: 413 });
  }

  const { state, userQuery } = body ?? {};

  // --- Cache by input hash (prevents repeated AI calls) ---
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const cacheUrl = new URL(request.url);
  cacheUrl.pathname = `/__cache/store-advice/${hash}`;
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });

  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const system = `
Eres un consultor experto para pequeños comercios minoristas en Argentina.
Responde SIEMPRE en español rioplatense, con consejos prácticos y breves.

Reglas:
- Sé conciso (máximo ~8 líneas).
- Prioriza: (1) stock crítico, (2) reposición, (3) precios/márgenes, (4) acciones rápidas hoy.
- Si falta información, pregunta 1 sola cosa puntual.
`.trim();

  const prompt = `
Contexto (estado del negocio en JSON):
${JSON.stringify(state ?? {}, null, 2)}

Consulta del usuario:
${(userQuery ?? "Dame recomendaciones para mejorar inventario y ventas esta semana.").toString().slice(0, 500)}
`.trim();

  const model = "@cf/meta/llama-3.2-3b-instruct";

  const result = await env.AI.run(model, {
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    // Keep it cheap on the free tier:
    max_tokens: 220,
    temperature: 0.3,
  });

  const answer =
    (result as any)?.response ??
    (result as any)?.result ??
    (typeof result === "string" ? result : JSON.stringify(result));

  const response = new Response(JSON.stringify({ answer }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Cache on the edge for 1 hour for identical inputs.
      "cache-control": "public, max-age=3600",
    },
  });

  waitUntil(caches.default.put(cacheKey, response.clone()));
  return response;
};
