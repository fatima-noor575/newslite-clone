import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScanLine } from "lucide-react";

export default function Scanner() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const onFile = (f: File) => { setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); };

  const analyze = async () => {
    if (!file || !user) return;
    setBusy(true); setResult(null);
    try {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const up = await supabase.storage.from("crop-scans").upload(path, file);
      if (up.error) throw up.error;
      const { data, error } = await supabase.functions.invoke("ai-disease-detect", { body: { image_path: path } });
      if (error) throw error;
      setResult(data);
      await supabase.from("disease_scans").insert({ user_id: user.id, image_path: path, diagnosis: data });
      toast.success("Diagnosis ready");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Disease scanner</h1>
      <p className="text-muted-foreground mt-1">Upload a leaf photo — AI will identify possible diseases.</p>

      <div className="mt-6 max-w-lg space-y-4">
        <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
        {preview && <img src={preview} alt="preview" className="rounded-lg border max-h-64 object-contain" />}
        <Button onClick={analyze} disabled={!file || busy}><ScanLine className="h-4 w-4 mr-2" />{busy ? "Analyzing…" : "Diagnose"}</Button>
      </div>

      {result && (
        <div className="mt-6 max-w-lg p-4 rounded-lg border bg-card">
          <div className="text-lg font-medium">{result.disease}</div>
          <div className="text-sm text-muted-foreground">Confidence: {Math.round((result.confidence ?? 0) * 100)}% · Severity: {result.severity}</div>
          {Array.isArray(result.treatment) && (
            <ul className="mt-3 list-disc pl-5 text-sm space-y-1">
              {result.treatment.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
          )}
          {result.notes && <p className="mt-3 text-sm text-muted-foreground">{result.notes}</p>}
        </div>
      )}
    </div>
  );
}
