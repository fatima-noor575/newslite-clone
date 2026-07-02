import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Disease detection from a leaf photo.
 * Input: { image_path: string }  — path inside the "crop-scans" storage bucket.
 * Output: { disease, confidence, severity, healthy, treatment[], prevention[], chemicals[], notes }
 */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!req.headers.get("Authorization")) return json({ error: "unauthorized" }, 401);

    const supa = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { image_path, crop_hint } = await req.json();
    if (!image_path || typeof image_path !== "string") {
      return json({ error: "image_path required" }, 400);
    }

    const { data: signed, error: sErr } = await supa.storage
      .from("crop-scans")
      .createSignedUrl(image_path, 600);
    if (sErr || !signed) return json({ error: sErr?.message || "Could not sign image URL" }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const system = `You are an expert plant pathologist. You examine a photograph of a plant leaf or crop and identify disease with clinical rigor.
Rules:
- If the leaf appears healthy, set "healthy": true and "disease": "Healthy".
- If the image does not show a plant/leaf, return "disease": "Not a leaf" and healthy=false, confidence=0.
- Confidence is between 0 and 1. Severity is one of: "none" | "mild" | "moderate" | "severe".
- Provide practical, region-agnostic treatment steps a smallholder farmer can act on.
- Prevention lists cultural/biological practices. Chemicals list common active ingredients (not brands).
- Respond with ONLY strict JSON, no prose, no markdown fences.`;

    const schemaPrompt = `Return this exact JSON shape:
{
  "disease": string,
  "healthy": boolean,
  "confidence": number,
  "severity": "none" | "mild" | "moderate" | "severe",
  "treatment": string[],
  "prevention": string[],
  "chemicals": string[],
  "notes": string
}`;

    // Try Gemini 2.5 Pro (best vision), fall back to Flash on failure.
    const models = ["google/gemini-2.5-pro", "google/gemini-2.5-flash"];
    let lastErr = "";
    for (const model of models) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: [
                { type: "text", text: `${schemaPrompt}\nCrop hint: ${crop_hint || "unknown"}. Analyze this image:` },
                { type: "image_url", image_url: { url: signed.signedUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (res.status === 429) return json({ error: "AI rate limit — please retry shortly." }, 429);
      if (res.status === 402) return json({ error: "AI credits exhausted for this workspace." }, 402);
      if (!res.ok) { lastErr = await res.text(); continue; }

      const j = await res.json();
      const content = j.choices?.[0]?.message?.content ?? "{}";
      const parsed = safeParse(content);
      // Normalize
      parsed.disease ??= "Unknown";
      parsed.healthy = !!parsed.healthy;
      parsed.confidence = clamp01(Number(parsed.confidence ?? 0));
      parsed.severity = ["none", "mild", "moderate", "severe"].includes(parsed.severity) ? parsed.severity : "none";
      parsed.treatment = ensureArray(parsed.treatment);
      parsed.prevention = ensureArray(parsed.prevention);
      parsed.chemicals = ensureArray(parsed.chemicals);
      parsed.notes = typeof parsed.notes === "string" ? parsed.notes : "";
      parsed.model = model;
      return json(parsed);
    }
    return json({ error: `AI request failed: ${lastErr || "unknown"}` }, 502);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function safeParse(s: string): any {
  try { return JSON.parse(s); } catch {
    // Try to extract a JSON object even if the model wrapped it.
    const m = s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch { /* noop */ } }
    return { notes: s };
  }
}
function ensureArray(v: any): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}
function clamp01(n: number) { return Math.max(0, Math.min(1, isFinite(n) ? n : 0)); }
