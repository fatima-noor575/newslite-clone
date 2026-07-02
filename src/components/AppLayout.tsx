import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Sprout, ScanLine, Droplets, FlaskConical,
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

  if (loading) return (
    <div className="min-h-screen grid place-items-center bg-hero">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Leaf className="h-5 w-5 animate-pulse text-primary" /> Loading…
      </div>
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;

  const initial = (user.email?.[0] || "U").toUpperCase();

  return (
    <div className="min-h-screen flex bg-hero text-foreground">
      <aside
        className="w-64 hidden md:flex flex-col text-sidebar-foreground"
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-gradient-gold grid place-items-center shadow-glow">
            <Leaf className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <div>
            <div className="font-display font-semibold tracking-tight text-sidebar-accent-foreground leading-none">AgroPilot</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 mt-0.5">Digital Farm</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-elev-sm"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" /> {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground text-sm font-semibold">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs truncate text-sidebar-accent-foreground">{user.email}</div>
              <div className="text-[10px] text-sidebar-foreground/60">Signed in</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            onClick={async () => { await signOut(); navigate("/"); }}
          >
            <LogOut className="h-4 w-4 mr-2" /> {t("signOut")}
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden h-14 border-b border-border flex items-center px-4 gap-2 glass sticky top-0 z-10">
          <div className="h-7 w-7 rounded-md bg-gradient-gold grid place-items-center">
            <Leaf className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="font-display font-semibold">AgroPilot</span>
        </div>
        <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
