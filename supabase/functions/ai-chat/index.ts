import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return new Response("LOVABLE_API_KEY missing", { status: 500, headers: corsHeaders });
    const { messages } = await req.json();

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        stream: true,
        messages: [
          { role: "system", content: "You are AgroPilot, a helpful farming assistant. Give practical, concise advice for smallholder farmers." },
          ...messages,
        ],
      }),
    });
    if (!upstream.ok || !upstream.body) return new Response(await upstream.text(), { status: upstream.status, headers: corsHeaders });

    // Transform OpenAI-style SSE deltas into a plain text stream
    const reader = upstream.body.getReader();
    const dec = new TextDecoder();
    const enc = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const l = line.trim();
            if (!l.startsWith("data:")) continue;
            const payload = l.slice(5).trim();
            if (payload === "[DONE]") { controller.close(); return; }
            try {
              const j = JSON.parse(payload);
              const delta = j.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(enc.encode(delta));
            } catch { /* ignore */ }
          }
        }
        controller.close();
      },
    });
    return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e) {
    return new Response(String(e), { status: 500, headers: corsHeaders });
  }
});
