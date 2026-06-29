"use client";
import { useState } from "react";
import { MessageSquare, X, Send } from "lucide-react";
import { chat } from "@/services/ai";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user"|"ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<"en"|"ur"|"pn">("en");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const q = input; setInput(""); setMsgs(m => [...m, { role:"user", text:q }]); setBusy(true);
    try { const { answer } = await chat(q, lang); setMsgs(m => [...m, { role:"ai", text: answer }]); }
    catch { setMsgs(m => [...m, { role:"ai", text:"Error reaching AI." }]); }
    setBusy(false);
  }

  return (
    <>
      <button onClick={() => setOpen(o => !o)} aria-label="Open AI chat"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-agro-600 text-white shadow-lg flex items-center justify-center">
        {open ? <X /> : <MessageSquare />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[28rem] bg-white dark:bg-neutral-900 border rounded-lg shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="font-semibold">AgroPilot AI</div>
            <select value={lang} onChange={e=>setLang(e.target.value as any)} className="text-xs border rounded px-1">
              <option value="en">EN</option><option value="ur">اردو</option><option value="pn">ਪੰਜਾਬੀ</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {msgs.map((m,i)=>(
              <div key={i} className={m.role==="user" ? "text-right" : ""}>
                <span className={"inline-block px-3 py-2 rounded "+(m.role==="user"?"bg-agro-600 text-white":"bg-neutral-100 dark:bg-neutral-800")}>{m.text}</span>
              </div>
            ))}
            {busy && <div className="opacity-60 text-xs">Thinking…</div>}
          </div>
          <div className="border-t p-2 flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter" && send()}
              className="flex-1 border rounded px-2 py-1 bg-transparent" placeholder="Ask anything about your farm…" />
            <button onClick={send} className="p-2 rounded bg-agro-600 text-white"><Send className="h-4 w-4"/></button>
          </div>
        </div>
      )}
    </>
  );
}
