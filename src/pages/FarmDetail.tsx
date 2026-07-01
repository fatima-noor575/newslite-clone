import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function FarmDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [farm, setFarm] = useState<any>(null);
  const [crops, setCrops] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", variety: "", planted_at: "", expected_harvest_at: "", area_hectares: "", status: "planted" });

  const load = async () => {
    const [f, c] = await Promise.all([
      supabase.from("farms").select("*").eq("id", id!).maybeSingle(),
      supabase.from("crops").select("*").eq("farm_id", id!).order("created_at", { ascending: false }),
    ]);
    setFarm(f.data); setCrops(c.data ?? []);
  };
  useEffect(() => { if (id) load(); }, [id]);

  const create = async () => {
    if (!user || !id || !form.name) return;
    const { error } = await supabase.from("crops").insert({
      user_id: user.id, farm_id: id, name: form.name, variety: form.variety || null,
      planted_at: form.planted_at || null, expected_harvest_at: form.expected_harvest_at || null,
      area_hectares: form.area_hectares ? Number(form.area_hectares) : null,
      status: form.status,
    });
    if (error) return toast.error(error.message);
    toast.success("Crop added");
    setForm({ name: "", variety: "", planted_at: "", expected_harvest_at: "", area_hectares: "", status: "planted" });
    setOpen(false); load();
  };

  if (!farm) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div>
      <Link to="/farms" className="text-sm text-muted-foreground inline-flex items-center gap-1 mb-4"><ArrowLeft className="h-3 w-3" />Farms</Link>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{farm.name}</h1>
          <p className="text-muted-foreground mt-1">{farm.location || "—"} · {farm.size_hectares ?? "—"} ha · {farm.soil_type || "soil n/a"}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New crop</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add crop</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Variety</Label><Input value={form.variety} onChange={e => setForm({ ...form, variety: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Planted</Label><Input type="date" value={form.planted_at} onChange={e => setForm({ ...form, planted_at: e.target.value })} /></div>
                <div><Label>Expected harvest</Label><Input type="date" value={form.expected_harvest_at} onChange={e => setForm({ ...form, expected_harvest_at: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Area (ha)</Label><Input type="number" step="0.01" value={form.area_hectares} onChange={e => setForm({ ...form, area_hectares: e.target.value })} /></div>
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["planted", "growing", "harvested", "failed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={create} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <h2 className="mt-8 font-medium">Crops</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {crops.length === 0 && <div className="text-sm text-muted-foreground">No crops yet.</div>}
        {crops.map(c => (
          <Link key={c.id} to={`/crops/${c.id}`} className="p-4 rounded-lg border bg-card hover:border-primary/50 transition">
            <div className="flex justify-between">
              <div className="font-medium">{c.name} {c.variety && <span className="text-muted-foreground">· {c.variety}</span>}</div>
              <span className="text-xs px-2 py-0.5 rounded bg-muted">{c.status}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{c.area_hectares ?? "—"} ha</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
