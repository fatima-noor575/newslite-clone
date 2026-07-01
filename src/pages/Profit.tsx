import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Profit() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "Baseline", area_ha: "1", cost_per_ha: "50000", yield_kg: "3500", price_per_kg: "40" });

  const calc = useMemo(() => {
    const area = +form.area_ha || 0;
    const cost = (+form.cost_per_ha || 0) * area;
    const revenue = (+form.yield_kg || 0) * (+form.price_per_kg || 0);
    const profit = revenue - cost;
    const roi = cost > 0 ? profit / cost : 0;
    const breakEven = (+form.yield_kg || 0) > 0 ? cost / +form.yield_kg : 0;
    return { cost, revenue, profit, roi, breakEven };
  }, [form]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profit_scenarios").insert({
      user_id: user.id, name: form.name,
      cost_per_hectare: +form.cost_per_ha,
      expected_price_per_kg: +form.price_per_kg,
      expected_yield_kg: +form.yield_kg,
      roi: calc.roi, break_even_price: calc.breakEven,
      scenarios: { area_ha: +form.area_ha, revenue: calc.revenue, profit: calc.profit, cost: calc.cost },
    });
    if (error) toast.error(error.message); else toast.success("Scenario saved");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Profit calculator</h1>
      <p className="text-muted-foreground mt-1">Run ROI and break-even numbers for any scenario.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div><Label>Scenario name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label>Area (ha)</Label><Input type="number" value={form.area_ha} onChange={e => setForm({ ...form, area_ha: e.target.value })} /></div>
          <div><Label>Cost per ha</Label><Input type="number" value={form.cost_per_ha} onChange={e => setForm({ ...form, cost_per_ha: e.target.value })} /></div>
          <div><Label>Expected yield (kg)</Label><Input type="number" value={form.yield_kg} onChange={e => setForm({ ...form, yield_kg: e.target.value })} /></div>
          <div><Label>Price per kg</Label><Input type="number" value={form.price_per_kg} onChange={e => setForm({ ...form, price_per_kg: e.target.value })} /></div>
          <Button onClick={save}>Save scenario</Button>
        </div>
        <div className="p-6 rounded-lg border bg-card space-y-3">
          <Row label="Total cost" value={calc.cost.toLocaleString()} />
          <Row label="Revenue" value={calc.revenue.toLocaleString()} />
          <Row label="Profit" value={calc.profit.toLocaleString()} highlight />
          <Row label="ROI" value={`${(calc.roi * 100).toFixed(1)}%`} />
          <Row label="Break-even price / kg" value={calc.breakEven.toFixed(2)} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "font-semibold text-lg" : ""}>{value}</span>
    </div>
  );
}
