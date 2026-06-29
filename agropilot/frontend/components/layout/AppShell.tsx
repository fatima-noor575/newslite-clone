import { Sidebar } from "./Sidebar";
import { ChatWidget } from "@/components/ChatWidget";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
      <ChatWidget />
    </div>
  );
}
