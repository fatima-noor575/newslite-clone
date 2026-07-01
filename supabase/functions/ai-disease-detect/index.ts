import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { image_path } = await req.json();
    if (!image_path) return json({ error: "image_path required" }, 400);

    const { data: signed, error: sErr } = await supa.storage.from("crop-scans").createSignedUrl(image_path, 300);
    if (sErr || !signed) return json({ error: sErr?.message || "sign failed" }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const prompt = `You are a plant pathologist. Look at this leaf/crop image and identify any disease.
Respond ONLY with strict JSON, no markdown:
{"disease": string, "confidence": number (0-1), "severity": "none"|"mild"|"moderate"|"severe", "treatment": string[], "notes": string}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: signed.signedUrl } },
        ]}],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return json({ error: await res.text() }, res.status);
    const j = await res.json();
    const text = j.choices?.[0]?.message?.content ?? "{}";
    const parsed = safeJson(text);
    return json(parsed);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
function safeJson(s: string) { try { return JSON.parse(s); } catch { return { disease: "Unknown", confidence: 0, severity: "none", treatment: [], notes: s }; } }
