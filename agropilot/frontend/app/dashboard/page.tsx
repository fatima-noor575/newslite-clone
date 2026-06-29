import { AppShell } from "@/components/layout/AppShell";
export default function Dashboard() {
  const cards = [
    { t: "Farms", v: "—" }, { t: "Active Crops", v: "—" },
    { t: "Open Alerts", v: "—" }, { t: "Projected Profit", v: "—" },
  ];
  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.t} className="p-4 rounded border">
            <div className="text-sm opacity-70">{c.t}</div>
            <div className="text-2xl font-semibold mt-1">{c.v}</div>
          </div>
        ))}
      </div>
      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded border"><h2 className="font-semibold mb-2">Today's risks</h2><p className="text-sm opacity-70">High humidity — monitor for fungal disease.</p></div>
        <div className="p-4 rounded border"><h2 className="font-semibold mb-2">Priority tasks</h2><ul className="text-sm list-disc pl-5"><li>Irrigate Field A</li><li>Apply NPK on Field B</li></ul></div>
      </section>
    </AppShell>
  );
}
