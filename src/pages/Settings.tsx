import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { setLang, getLang, Lang } from "@/lib/i18n";

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>({ name: "", preferred_language: "en" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) setProfile(data);
    })();
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update({
      name: profile.name, preferred_language: profile.preferred_language,
    }).eq("user_id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    setLang(profile.preferred_language as Lang);
    toast.success("Saved");
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="mt-6 space-y-4">
        <div><Label>Name</Label><Input value={profile.name || ""} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
        <div><Label>Email</Label><Input value={user?.email || ""} disabled /></div>
        <div>
          <Label>Language</Label>
          <Select value={profile.preferred_language || getLang()} onValueChange={v => setProfile({ ...profile, preferred_language: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ur">اردو</SelectItem>
              <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
      </div>
    </div>
  );
}
