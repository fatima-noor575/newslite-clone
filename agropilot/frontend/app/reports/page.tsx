import { AppShell } from "@/components/layout/AppShell";
export default function Page() {
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <p className="opacity-70 text-sm">Module wired to /reports endpoint. See API client in services/.</p>
    </AppShell>
  );
}
