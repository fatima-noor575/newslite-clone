import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Sprout, Wheat, Bell, CloudSun, ScanLine, ArrowRight, TrendingUp, Droplets } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ farms: 0, crops: 0, unread: 0, scans: 0 });
  const [recentFarms, setRecentFarms] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [f, c, n, s, rf] = await Promise.all([
        supabase.from("farms").select("id", { count: "exact", head: true }),
        supabase.from("crops").select("id", { count: "exact", head: true }).in("status", ["planted", "growing"]),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("read", false),
        supabase.from("disease_scans").select("id", { count: "exact", head: true }),
        supabase.from("farms").select("id, name, location, size_hectares").order("created_at", { ascending: false }).limit(4),
      ]);
      setStats({ farms: f.count ?? 0, crops: c.count ?? 0, unread: n.count ?? 0, scans: s.count ?? 0 });
      setRecentFarms(rf.data ?? []);
    })();
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();
  const displayName = (user?.user_metadata?.name || user?.email?.split("@")[0] || "farmer").split(" ")[0];

  const kpis = [
    { to: "/farms", label: "Farms", value: stats.farms, Icon: Sprout, tint: "from-emerald-500/10 to-emerald-500/0" },
    { to: "/farms", label: "Active crops", value: stats.crops, Icon: Wheat, tint: "from-amber-500/10 to-amber-500/0" },
    { to: "/scanner", label: "Disease scans", value: stats.scans, Icon: ScanLine, tint: "from-sky-500/10 to-sky-500/0" },
    { to: "/notifications", label: "Unread alerts", value: stats.unread, Icon: Bell, tint: "from-rose-500/10 to-rose-500/0" },
  ];

  const quick = [
    { to: "/scanner", label: "Scan a leaf", body: "Diagnose disease in seconds", Icon: ScanLine },
    { to: "/irrigation", label: "Irrigation advice", body: "Right water, right time", Icon: Droplets },
    { to: "/weather", label: "Live forecast", body: "7 days at your farm", Icon: CloudSun },
    { to: "/yield", label: "Predict yield", body: "Forecast this harvest", Icon: TrendingUp },
  ];

  return (
    <div>
      <div>
        <p className="text-sm text-muted-foreground">{greeting},</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{displayName}.</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening across your operation.</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ to, label, value, Icon, tint }, i) => (
          <Link
            key={label}
            to={to}
            className={`relative p-6 rounded-2xl border border-border bg-gradient-card shadow-elev-sm hover:shadow-elev-md hover:-translate-y-0.5 transition-all overflow-hidden animate-slide-up`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tint} pointer-events-none`} />
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-5 font-display text-4xl font-semibold tabular-nums">{value}</div>
              <div className="text-sm text-muted-foreground mt-1">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Recent farms */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-elev-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Recent farms</h2>
            <Link to="/farms" className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentFarms.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No farms yet. <Link to="/farms" className="text-primary hover:underline">Add your first farm</Link>.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentFarms.map(f => (
                <Link
                  key={f.id}
                  to={`/farms/${f.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
                      <Sprout className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.location || "No location"} · {f.size_hectares ?? "—"} ha</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-elev-sm">
          <h2 className="font-display text-lg font-semibold mb-4">Quick actions</h2>
          <div className="space-y-2">
            {quick.map(({ to, label, body, Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{body}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
