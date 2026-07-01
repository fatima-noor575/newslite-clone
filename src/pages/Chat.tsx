import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your AgroPilot assistant. Ask me anything about your farm." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("chat_threads").insert({ user_id: user.id, title: "Chat" }).select().single();
      if (data) setThreadId(data.id);
    })();
  }, [user]);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const userMsg: Msg = { role: "user", content: input };
    setMessages(m => [...m, userMsg, { role: "assistant", content: "" }]);
    setInput(""); setBusy(true);
    try {
      const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/ai-chat`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader(); const dec = new TextDecoder(); let acc = "";
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        acc += dec.decode(value);
        setMessages(m => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; });
      }
      if (threadId && user) {
        await supabase.from("chat_messages").insert([
          { thread_id: threadId, user_id: user.id, role: "user", parts: [{ type: "text", text: userMsg.content }] },
          { thread_id: threadId, user_id: user.id, role: "assistant", parts: [{ type: "text", text: acc }] },
        ]);
      }
    } catch (e: any) {
      setMessages(m => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: "Sorry — " + (e.message || "error") }; return c; });
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">AI assistant</h1>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] p-3 rounded-lg text-sm ${m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
            {m.content || <span className="opacity-50">…</span>}
          </div>
        ))}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="mt-4 flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about crops, weather, pests…" disabled={busy} />
        <Button type="submit" disabled={busy}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
