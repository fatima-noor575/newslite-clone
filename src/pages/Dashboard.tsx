import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Sprout, Wheat, Bell, CloudSun } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ farms: 0, crops: 0, unread: 0 });

  useEffect(() => {
    (async () => {
      const [f, c, n] = await Promise.all([
        supabase.from("farms").select("id", { count: "exact", head: true }),
        supabase.from("crops").select("id", { count: "exact", head: true }).in("status", ["planted", "growing"]),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
      ]);
      setStats({ farms: f.count ?? 0, crops: c.count ?? 0, unread: n.count ?? 0 });
    })();
  }, []);

  const cards = [
    { to: "/farms", label: "Farms", value: stats.farms, Icon: Sprout },
    { to: "/farms", label: "Active crops", value: stats.crops, Icon: Wheat },
    { to: "/notifications", label: "Unread alerts", value: stats.unread, Icon: Bell },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <p className="text-muted-foreground mt-1">Your farm at a glance.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map(({ to, label, value, Icon }) => (
          <Link key={label} to={to} className="p-6 rounded-lg border bg-card hover:border-primary/50 transition">
            <Icon className="h-5 w-5 text-primary" />
            <div className="mt-4 text-3xl font-semibold">{value}</div>
            <div className="text-sm text-muted-foreground mt-1">{label}</div>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link to="/weather" className="p-6 rounded-lg border bg-card">
          <CloudSun className="h-5 w-5 text-primary mb-2" />
          <div className="font-medium">Weather (sample data)</div>
          <p className="text-sm text-muted-foreground mt-1">Preview weather-driven advisories with a demo dataset.</p>
        </Link>
        <Link to="/scanner" className="p-6 rounded-lg border bg-card">
          <div className="font-medium">Quick actions</div>
          <p className="text-sm text-muted-foreground mt-1">Scan a leaf, request irrigation advice, or forecast yield.</p>
        </Link>
      </div>
    </div>
  );
}
