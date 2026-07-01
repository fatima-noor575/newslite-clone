import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export default function CropDetail() {
  const { id } = useParams();
  const [crop, setCrop] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [yields, setYields] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [c, s, y] = await Promise.all([
        supabase.from("crops").select("*, farms(name)").eq("id", id).maybeSingle(),
        supabase.from("disease_scans").select("*").eq("crop_id", id).order("created_at", { ascending: false }),
        supabase.from("yield_predictions").select("*").eq("crop_id", id).order("created_at", { ascending: false }),
      ]);
      setCrop(c.data); setScans(s.data ?? []); setYields(y.data ?? []);
    })();
  }, [id]);

  if (!crop) return <div className="text-muted-foreground">Loading…</div>;

  return (
    <div>
      <Link to={`/farms/${crop.farm_id}`} className="text-sm text-muted-foreground inline-flex items-center gap-1 mb-4">
        <ArrowLeft className="h-3 w-3" />{crop.farms?.name || "Farm"}
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{crop.name}</h1>
      <p className="text-muted-foreground mt-1">
        {crop.variety || "—"} · {crop.status} · {crop.area_hectares ?? "—"} ha ·
        planted {crop.planted_at || "—"}, harvest {crop.expected_harvest_at || "—"}
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="font-medium mb-2">Disease scans</h2>
          {scans.length === 0 ? <p className="text-sm text-muted-foreground">No scans.</p> :
            scans.map(s => (
              <div key={s.id} className="p-3 border rounded mb-2 text-sm">
                <div className="font-medium">{s.diagnosis?.disease || "Pending"}</div>
                <div className="text-muted-foreground text-xs">{new Date(s.created_at).toLocaleString()}</div>
              </div>
            ))}
        </section>
        <section>
          <h2 className="font-medium mb-2">Yield predictions</h2>
          {yields.length === 0 ? <p className="text-sm text-muted-foreground">No predictions.</p> :
            yields.map(y => (
              <div key={y.id} className="p-3 border rounded mb-2 text-sm">
                <div className="font-medium">{y.predicted_yield_kg} kg</div>
                <div className="text-muted-foreground text-xs">{new Date(y.created_at).toLocaleString()}</div>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}
