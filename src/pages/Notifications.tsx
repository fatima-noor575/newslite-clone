import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Notifications() {
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
      <div className="mt-6 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground">You're all caught up.</p>}
        {items.map(n => (
          <div key={n.id} className={`p-4 border rounded-lg flex justify-between items-start bg-card ${n.read ? "opacity-60" : ""}`}>
            <div>
              <div className="font-medium">{n.title}</div>
              {n.body && <div className="text-sm text-muted-foreground mt-1">{n.body}</div>}
              <div className="text-xs text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>}
          </div>
        ))}
      </div>
    </div>
  );
}
