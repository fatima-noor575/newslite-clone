import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ScanLine, Upload, Leaf, ShieldCheck, AlertTriangle, Sparkles } from "lucide-react";

type Crop = { id: string; name: string; variety: string | null };
type Diagnosis = {
  disease: string; healthy: boolean; confidence: number;
  severity: "none" | "mild" | "moderate" | "severe";
  treatment: string[]; prevention: string[]; chemicals: string[]; notes: string;
};

const severityStyle: Record<Diagnosis["severity"], string> = {
  none: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  mild: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  moderate: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  severe: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export default function Scanner() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [cropId, setCropId] = useState<string>("");
  const [cropHint, setCropHint] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("crops").select("id, name, variety").order("created_at", { ascending: false });
      setCrops((data as any) ?? []);
    })();
  }, []);

  const onFile = (f: File) => {
    if (f.size > 8 * 1024 * 1024) return toast.error("Image too large (max 8MB).");
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image file.");
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null);
  };

  const analyze = async () => {
    if (!file || !user) return;
    setBusy(true); setResult(null);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from("crop-scans").upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (up.error) throw up.error;

      const chosenCrop = crops.find(c => c.id === cropId);
      const hint = cropHint || chosenCrop?.name || "";

      const { data, error } = await supabase.functions.invoke("ai-disease-detect", {
        body: { image_path: path, crop_hint: hint },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const diag = data as Diagnosis;
      setResult(diag);
      await supabase.from("disease_scans").insert({
        user_id: user.id,
        crop_id: cropId || null,
        image_path: path,
        diagnosis: diag as any,
      });
      toast.success("Diagnosis ready");
    } catch (e: any) {
      toast.error(e.message || "Detection failed");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-primary text-primary-foreground grid place-items-center shadow-elev-md">
          <ScanLine className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Disease scanner</h1>
          <p className="text-muted-foreground mt-1">Upload a leaf photo — AI identifies disease, severity and next steps.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Upload */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-elev-sm space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Link to a crop (optional)</label>
            {crops.length > 0 ? (
              <Select value={cropId} onValueChange={setCropId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a crop from your farms" /></SelectTrigger>
                <SelectContent>
                  {crops.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.variety ? ` · ${c.variety}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input className="mt-1" placeholder="Crop name (e.g. Wheat)" value={cropHint} onChange={e => setCropHint(e.target.value)} />
            )}
          </div>

          <label htmlFor="scan-file" className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition">
            {preview ? (
              <img src={preview} alt="preview" className="mx-auto max-h-64 rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-sm font-medium">Click to upload a leaf image</div>
                <div className="text-xs text-muted-foreground mt-1">PNG, JPG up to 8 MB</div>
              </>
            )}
            <input
              id="scan-file" type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>

          <Button onClick={analyze} disabled={!file || busy} className="w-full bg-gradient-primary shadow-elev-md">
            <Sparkles className="h-4 w-4 mr-2" />
            {busy ? "Analyzing…" : "Diagnose"}
          </Button>
        </div>

        {/* Result */}
        <div className="min-h-[300px]">
          {!result && !busy && (
            <div className="h-full p-10 rounded-2xl border border-dashed border-border bg-card/50 grid place-items-center text-center">
              <div>
                <Leaf className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="mt-3 text-muted-foreground">Your diagnosis will appear here.</p>
              </div>
            </div>
          )}
          {busy && (
            <div className="h-full p-10 rounded-2xl border border-border bg-card grid place-items-center text-center">
              <div>
                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="mt-3 text-muted-foreground">Examining your leaf photo…</p>
              </div>
            </div>
          )}
          {result && (
            <div className="p-6 rounded-2xl border border-border bg-gradient-card shadow-elev-md animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Diagnosis</div>
                  <h2 className="font-display text-2xl font-semibold mt-1 flex items-center gap-2">
                    {result.healthy ? <ShieldCheck className="h-6 w-6 text-emerald-600" /> : <AlertTriangle className="h-6 w-6 text-amber-600" />}
                    {result.disease}
                  </h2>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${severityStyle[result.severity]}`}>
                  {result.severity}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Confidence</span><span>{Math.round(result.confidence * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: `${Math.round(result.confidence * 100)}%` }} />
                </div>
              </div>

              {result.treatment.length > 0 && (
                <Section title="Treatment">
                  <ul className="text-sm space-y-1.5 list-disc pl-5">{result.treatment.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </Section>
              )}
              {result.prevention.length > 0 && (
                <Section title="Prevention">
                  <ul className="text-sm space-y-1.5 list-disc pl-5">{result.prevention.map((t, i) => <li key={i}>{t}</li>)}</ul>
                </Section>
              )}
              {result.chemicals.length > 0 && (
                <Section title="Recommended active ingredients">
                  <div className="flex flex-wrap gap-1.5">
                    {result.chemicals.map((c, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-md bg-muted text-foreground">{c}</span>
                    ))}
                  </div>
                </Section>
              )}
              {result.notes && <p className="mt-4 text-sm text-muted-foreground">{result.notes}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      {children}
    </div>
  );
}
