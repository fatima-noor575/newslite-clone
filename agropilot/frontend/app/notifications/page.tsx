import { AppShell } from "@/components/layout/AppShell";
export default function Page() {
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="opacity-70 text-sm">Module wired to /notifications endpoint. See API client in services/.</p>
    </AppShell>
  );
}
