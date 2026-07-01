import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";

type Farm = { id: string; name: string; location: string | null; size_hectares: number | null; soil_type: string | null };

export default function Farms() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", size_hectares: "", soil_type: "", notes: "" });

  const load = async () => {
    const { data } = await supabase.from("farms").select("*").order("created_at", { ascending: false });
    setFarms((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user || !form.name) return;
    const { error } = await supabase.from("farms").insert({
      user_id: user.id, name: form.name, location: form.location || null,
      size_hectares: form.size_hectares ? Number(form.size_hectares) : null,
      soil_type: form.soil_type || null, notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Farm added");
    setForm({ name: "", location: "", size_hectares: "", soil_type: "", notes: "" });
    setOpen(false);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Farms</h1>
          <p className="text-muted-foreground mt-1">All your registered farms.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New farm</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add farm</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Size (ha)</Label><Input type="number" step="0.01" value={form.size_hectares} onChange={e => setForm({ ...form, size_hectares: e.target.value })} /></div>
                <div><Label>Soil type</Label><Input value={form.soil_type} onChange={e => setForm({ ...form, soil_type: e.target.value })} /></div>
              </div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <Button onClick={create} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {farms.length === 0 && <div className="text-muted-foreground text-sm">No farms yet. Add your first farm.</div>}
        {farms.map(f => (
          <Link key={f.id} to={`/farms/${f.id}`} className="p-5 rounded-lg border bg-card hover:border-primary/50 transition">
            <div className="font-medium">{f.name}</div>
            {f.location && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{f.location}</div>}
            <div className="text-sm text-muted-foreground mt-2">
              {f.size_hectares ?? "—"} ha · {f.soil_type || "soil n/a"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
