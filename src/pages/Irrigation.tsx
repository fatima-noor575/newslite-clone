import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Irrigation() {
  const { user } = useAuth();
  const [form, setForm] = useState({ crop: "Wheat", soil: "loam", temp_c: "28", rainfall_mm: "5", growth_stage: "vegetative" });
  const [busy, setBusy] = useState(false);
  const [rec, setRec] = useState<any>(null);

  const run = async () => {
    setBusy(true); setRec(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-irrigation", {
        body: { ...form, temp_c: Number(form.temp_c), rainfall_mm: Number(form.rainfall_mm) },
      });
      if (error) throw error;
      setRec(data);
      if (user) await supabase.from("advisories").insert({ user_id: user.id, kind: "irrigation", input: form, recommendation: data });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Irrigation advisor</h1>
      <p className="text-muted-foreground mt-1">Get a watering recommendation based on crop, soil, temperature and recent rainfall.</p>

      <div className="mt-6 grid gap-3 max-w-lg">
        {[
          ["crop", "Crop"], ["soil", "Soil"], ["growth_stage", "Growth stage"],
        ].map(([k, l]) => (
          <div key={k}><Label>{l}</Label><Input value={(form as any)[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Temp (°C)</Label><Input type="number" value={form.temp_c} onChange={e => setForm({ ...form, temp_c: e.target.value })} /></div>
          <div><Label>Rain last 7d (mm)</Label><Input type="number" value={form.rainfall_mm} onChange={e => setForm({ ...form, rainfall_mm: e.target.value })} /></div>
        </div>
        <Button onClick={run} disabled={busy}>{busy ? "Thinking…" : "Get recommendation"}</Button>
      </div>

      {rec && (
        <div className="mt-6 max-w-lg p-4 rounded-lg border bg-card">
          <div className="font-medium">{rec.summary}</div>
          <div className="text-sm text-muted-foreground mt-1">Water: {rec.mm_per_day} mm/day · Frequency: {rec.frequency}</div>
          {rec.reasoning && <p className="mt-3 text-sm">{rec.reasoning}</p>}
        </div>
      )}
    </div>
  );
}
