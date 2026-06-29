"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Tractor, Sprout, Camera, Cloud, Droplets, Beaker,
  BarChart3, FileText, MessageSquare, Bell, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/farms", label: "Farms", icon: Tractor },
  { href: "/crops", label: "Crops", icon: Sprout },
  { href: "/scanner", label: "Crop Scanner", icon: Camera },
  { href: "/weather", label: "Weather", icon: Cloud },
  { href: "/irrigation", label: "Irrigation", icon: Droplets },
  { href: "/fertilizer", label: "Fertilizer", icon: Beaker },
  { href: "/profit", label: "Profit", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const p = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r min-h-screen p-4 space-y-1">
      <div className="text-xl font-bold text-agro-600 mb-6">AgroPilot</div>
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}
          className={cn("flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900",
                       p?.startsWith(href) && "bg-agro-50 text-agro-700 font-medium")}>
          <Icon className="h-4 w-4" /> {label}
        </Link>
      ))}
    </aside>
  );
}
