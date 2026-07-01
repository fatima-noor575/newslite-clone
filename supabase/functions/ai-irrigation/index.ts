import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "LOVABLE_API_KEY missing" }, 500);
    const { crop, soil, temp_c, rainfall_mm, growth_stage } = await req.json();

    const prompt = `You are an agronomist. Recommend an irrigation plan.
Crop: ${crop}. Soil: ${soil}. Growth stage: ${growth_stage}.
Recent avg temp: ${temp_c}°C. Rainfall last 7 days: ${rainfall_mm} mm.
Respond ONLY with JSON: {"summary": string, "mm_per_day": number, "frequency": string, "reasoning": string}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return json({ error: await res.text() }, res.status);
    const j = await res.json();
    return json(JSON.parse(j.choices?.[0]?.message?.content ?? "{}"));
  } catch (e) { return json({ error: String(e) }, 500); }
});
function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
