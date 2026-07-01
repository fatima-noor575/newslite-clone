import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Fertilizer() {
  const { user } = useAuth();
  const [form, setForm] = useState({ crop: "Wheat", stage: "vegetative", soil_n: "20", soil_p: "15", soil_k: "18", area_ha: "1" });
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<any>(null);

  const run = async () => {
    setBusy(true); setRec(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-fertilizer", {
        body: {
          crop: form.crop, stage: form.stage,
          soil: { n: +form.soil_n, p: +form.soil_p, k: +form.soil_k },
          area_ha: +form.area_ha,
        },
      });
      if (error) throw error;
      setRec(data);
      if (user) await supabase.from("advisories").insert({ user_id: user.id, kind: "fertilizer", input: form, recommendation: data });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Fertilizer plan</h1>
      <p className="text-muted-foreground mt-1">NPK recommendation based on your soil test and crop stage.</p>
      <div className="mt-6 grid gap-3 max-w-lg">
        <div><Label>Crop</Label><Input value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} /></div>
        <div><Label>Stage</Label><Input value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} /></div>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>N (ppm)</Label><Input type="number" value={form.soil_n} onChange={e => setForm({ ...form, soil_n: e.target.value })} /></div>
          <div><Label>P (ppm)</Label><Input type="number" value={form.soil_p} onChange={e => setForm({ ...form, soil_p: e.target.value })} /></div>
          <div><Label>K (ppm)</Label><Input type="number" value={form.soil_k} onChange={e => setForm({ ...form, soil_k: e.target.value })} /></div>
        </div>
        <div><Label>Area (ha)</Label><Input type="number" value={form.area_ha} onChange={e => setForm({ ...form, area_ha: e.target.value })} /></div>
        <Button onClick={run} disabled={busy}>{busy ? "Thinking…" : "Get plan"}</Button>
      </div>

      {rec && (
        <div className="mt-6 max-w-lg p-4 rounded-lg border bg-card space-y-2">
          <div className="font-medium">{rec.plan_name}</div>
          <div className="text-sm">N: {rec.n_kg_ha} kg/ha · P: {rec.p_kg_ha} kg/ha · K: {rec.k_kg_ha} kg/ha</div>
          <div className="text-sm text-muted-foreground">Total for {form.area_ha} ha: {rec.total_kg} kg</div>
          {rec.notes && <p className="text-sm">{rec.notes}</p>}
        </div>
      )}
    </div>
  );
}
