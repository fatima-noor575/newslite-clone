import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { FileText, Download } from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    setReports(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const [farms, crops, scans] = await Promise.all([
        supabase.from("farms").select("*"),
        supabase.from("crops").select("*"),
        supabase.from("disease_scans").select("*"),
      ]);
      const payload = {
        farms: farms.data?.length ?? 0,
        crops: crops.data?.length ?? 0,
        scans: scans.data?.length ?? 0,
        generated_at: new Date().toISOString(),
      };
      const doc = new jsPDF();
      doc.setFontSize(18); doc.text("AgroPilot Farm Report", 20, 20);
      doc.setFontSize(11); doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
      doc.text(`Farms: ${payload.farms}`, 20, 45);
      doc.text(`Crops: ${payload.crops}`, 20, 55);
      doc.text(`Disease scans: ${payload.scans}`, 20, 65);
      const blob = doc.output("blob");
      const path = `${user.id}/report-${Date.now()}.pdf`;
      const up = await supabase.storage.from("reports").upload(path, blob, { contentType: "application/pdf" });
      if (up.error) throw up.error;
      const { error } = await supabase.from("reports").insert({
        user_id: user.id, title: `Farm summary — ${new Date().toLocaleDateString()}`,
        kind: "farm-summary", payload, pdf_path: path,
      });
      if (error) throw error;
      toast.success("Report generated");
      load();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setBusy(false); }
  };

  const download = async (path: string) => {
    const { data } = await supabase.storage.from("reports").createSignedUrl(path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate PDF summaries of your farm data.</p>
        </div>
        <Button onClick={generate} disabled={busy}><FileText className="h-4 w-4 mr-2" />{busy ? "Generating…" : "New report"}</Button>
      </div>
      <div className="mt-6 space-y-2">
        {reports.length === 0 && <p className="text-sm text-muted-foreground">No reports yet.</p>}
        {reports.map(r => (
          <div key={r.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
            </div>
            {r.pdf_path && <Button variant="ghost" size="sm" onClick={() => download(r.pdf_path)}><Download className="h-4 w-4 mr-2" />PDF</Button>}
          </div>
        ))}
      </div>
    </div>
  );
}
