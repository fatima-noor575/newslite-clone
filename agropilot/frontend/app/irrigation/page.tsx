"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import { recommendIrrigation } from "@/services/ai";
import type { IrrigationResult } from "@/types";

export default function IrrigationPage() {
  const [form, setForm] = useState({ crop_id: 1, soil_moisture_pct: 35, last_irrigation_days: 3 });
  const [r, setR] = useState<IrrigationResult | null>(null);
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Smart Irrigation</h1>
      <form onSubmit={async e=>{e.preventDefault(); setR(await recommendIrrigation(form));}}
        className="grid md:grid-cols-4 gap-2 max-w-3xl">
        <input type="number" placeholder="Crop ID" value={form.crop_id} onChange={e=>setForm({...form,crop_id:+e.target.value})} className="border rounded px-3 py-2 bg-transparent"/>
        <input type="number" placeholder="Soil moisture %" value={form.soil_moisture_pct} onChange={e=>setForm({...form,soil_moisture_pct:+e.target.value})} className="border rounded px-3 py-2 bg-transparent"/>
        <input type="number" placeholder="Days since last" value={form.last_irrigation_days} onChange={e=>setForm({...form,last_irrigation_days:+e.target.value})} className="border rounded px-3 py-2 bg-transparent"/>
        <button className="rounded bg-agro-600 text-white">Recommend</button>
      </form>
      {r && (
        <div className="mt-6 max-w-2xl border rounded p-4">
          <div className="text-lg font-semibold">{r.water_amount_liters_per_acre} L / acre</div>
          <div className="text-sm">{r.recommendation}</div>
          <div className="text-xs opacity-70 mt-2">Next schedule: {r.next_schedule}</div>
          <div className="text-xs opacity-70 mt-1">{r.reasoning}</div>
        </div>
      )}
    </AppShell>
  );
}
