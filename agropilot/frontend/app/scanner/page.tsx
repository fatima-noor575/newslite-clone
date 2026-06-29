"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import { detectDisease } from "@/services/ai";
import type { DiseaseResult } from "@/types";
import { toast } from "sonner";

export default function Scanner() {
  const [cropId, setCropId] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!file) return toast.error("Choose a leaf image");
    setLoading(true);
    try { setResult(await detectDisease(cropId, file)); }
    catch (e:any) { toast.error(e?.response?.data?.detail || "Detection failed"); }
    finally { setLoading(false); }
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Crop Disease Scanner</h1>
      <div className="space-y-3 max-w-xl">
        <input type="number" value={cropId} onChange={e=>setCropId(+e.target.value)}
          className="w-full border rounded px-3 py-2 bg-transparent" placeholder="Crop ID" />
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] || null)} />
        <button onClick={run} disabled={loading}
          className="px-4 py-2 rounded bg-agro-600 text-white">{loading?"Analyzing…":"Analyze leaf"}</button>
      </div>
      {result && (
        <div className="mt-6 max-w-2xl border rounded p-4 space-y-2">
          <div className="text-xl font-semibold">{result.disease_name}</div>
          <div className="text-sm opacity-70">
            Confidence: {(result.confidence*100).toFixed(0)}% · Severity: <b>{result.severity}</b>
          </div>
          <div><h3 className="font-semibold mt-2">Treatment</h3><p className="text-sm">{result.treatment}</p></div>
          <div><h3 className="font-semibold mt-2">Prevention</h3><p className="text-sm">{result.prevention}</p></div>
          <div><h3 className="font-semibold mt-2">Chemicals</h3>
            <ul className="text-sm list-disc pl-5">{result.chemicals.map((c,i)=><li key={i}>{c}</li>)}</ul>
          </div>
        </div>
      )}
    </AppShell>
  );
}
