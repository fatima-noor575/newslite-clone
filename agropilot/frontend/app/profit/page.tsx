"use client";
import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import { calcProfit } from "@/services/ai";
import type { ProfitResult } from "@/types";

export default function ProfitPage() {
  const [form, setForm] = useState({ crop_id:1, expected_price_per_kg:20, expected_yield_kg:1500, extra_costs:0 });
  const [r, setR] = useState<ProfitResult | null>(null);
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Profit Calculator</h1>
      <form onSubmit={async e=>{e.preventDefault(); setR(await calcProfit(form));}} className="grid md:grid-cols-5 gap-2 max-w-4xl">
        <input type="number" placeholder="Crop ID" value={form.crop_id} onChange={e=>setForm({...form,crop_id:+e.target.value})} className="border rounded px-3 py-2 bg-transparent"/>
        <input type="number" placeholder="Price/kg" value={form.expected_price_per_kg} onChange={e=>setForm({...form,expected_price_per_kg:+e.target.value})} className="border rounded px-3 py-2 bg-transparent"/>
        <input type="number" placeholder="Yield (kg)" value={form.expected_yield_kg} onChange={e=>setForm({...form,expected_yield_kg:+e.target.value})} className="border rounded px-3 py-2 bg-transparent"/>
        <input type="number" placeholder="Extra costs" value={form.extra_costs} onChange={e=>setForm({...form,extra_costs:+e.target.value})} className="border rounded px-3 py-2 bg-transparent"/>
        <button className="rounded bg-agro-600 text-white">Calculate</button>
      </form>
      {r && (
        <div className="mt-6 grid md:grid-cols-5 gap-3 max-w-4xl">
          {[
            ["Expenses", r.total_expenses],
            ["Revenue", r.estimated_revenue],
            ["Profit", r.estimated_profit],
            ["ROI %", r.roi_pct],
            ["Break-even/kg", r.break_even_price_per_kg],
          ].map(([k,v]) => (
            <div key={k as string} className="p-4 rounded border">
              <div className="text-xs opacity-70">{k}</div>
              <div className="text-xl font-semibold mt-1">{v as number}</div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
