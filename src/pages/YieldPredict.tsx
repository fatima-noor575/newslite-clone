import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function YieldPredict() {
  const { user } = useAuth();
  const [form, setForm] = useState({ crop: "Wheat", area_ha: "1", soil: "loam", rainfall_mm: "300", temp_avg_c: "24", history_notes: "" });
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<any>(null);

  const run = async () => {
    setBusy(true); setRec(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-yield-predict", {
        body: { ...form, area_ha: +form.area_ha, rainfall_mm: +form.rainfall_mm, temp_avg_c: +form.temp_avg_c },
      });
      if (error) throw error;
      setRec(data);
      if (user) await supabase.from("yield_predictions").insert({
        user_id: user.id, inputs: form, predicted_yield_kg: data.predicted_yield_kg, reasoning: data.reasoning,
      });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Yield prediction</h1>
      <p className="text-muted-foreground mt-1">Estimate expected yield based on crop and conditions.</p>
      <div className="mt-6 grid gap-3 max-w-lg">
        <div><Label>Crop</Label><Input value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Area (ha)</Label><Input type="number" value={form.area_ha} onChange={e => setForm({ ...form, area_ha: e.target.value })} /></div>
          <div><Label>Soil</Label><Input value={form.soil} onChange={e => setForm({ ...form, soil: e.target.value })} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Season rainfall (mm)</Label><Input type="number" value={form.rainfall_mm} onChange={e => setForm({ ...form, rainfall_mm: e.target.value })} /></div>
          <div><Label>Avg temp (°C)</Label><Input type="number" value={form.temp_avg_c} onChange={e => setForm({ ...form, temp_avg_c: e.target.value })} /></div>
        </div>
        <Button onClick={run} disabled={busy}>{busy ? "Thinking…" : "Predict"}</Button>
      </div>

      {rec && (
        <div className="mt-6 max-w-lg p-4 rounded-lg border bg-card">
          <div className="text-2xl font-semibold">{rec.predicted_yield_kg} kg</div>
          <div className="text-sm text-muted-foreground">≈ {(rec.predicted_yield_kg / +form.area_ha).toFixed(0)} kg/ha</div>
          {rec.reasoning && <p className="text-sm mt-3">{rec.reasoning}</p>}
        </div>
      )}
    </div>
  );
}
