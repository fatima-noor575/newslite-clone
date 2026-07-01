import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Sprout, Wheat, ScanLine, Droplets, FlaskConical,
  CloudSun, TrendingUp, Calculator, FileText, MessageSquare, Bell, Settings, LogOut, Leaf,
} from "lucide-react";
import { t, onLangChange } from "@/lib/i18n";
import { useEffect, useState } from "react";

const nav = [
  { to: "/dashboard", key: "dashboard", Icon: LayoutDashboard },
  { to: "/farms", key: "farms", Icon: Sprout },
  { to: "/scanner", key: "scanner", Icon: ScanLine },
  { to: "/irrigation", key: "irrigation", Icon: Droplets },
  { to: "/fertilizer", key: "fertilizer", Icon: FlaskConical },
  { to: "/weather", key: "weather", Icon: CloudSun },
  { to: "/yield", key: "yield", Icon: TrendingUp },
  { to: "/profit", key: "profit", Icon: Calculator },
  { to: "/reports", key: "reports", Icon: FileText },
  { to: "/chat", key: "chat", Icon: MessageSquare },
  { to: "/notifications", key: "notifications", Icon: Bell },
  { to: "/settings", key: "settings", Icon: Settings },
];

export default function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [, force] = useState(0);
  useEffect(() => onLangChange(() => force(x => x + 1)) as any, []);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-border">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-semibold tracking-tight">AgroPilot</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(({ to, key, Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }>
              <Icon className="h-4 w-4" /> {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="h-4 w-4 mr-2" /> {t("signOut")}
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden h-14 border-b flex items-center px-4 gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          <span className="font-semibold">AgroPilot</span>
        </div>
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
