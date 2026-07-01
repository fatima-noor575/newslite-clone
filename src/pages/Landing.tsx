import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, ScanLine, Droplets, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2"><Leaf className="h-5 w-5 text-primary" /><span className="font-semibold">AgroPilot</span></div>
          <Button asChild variant="ghost"><Link to={user ? "/dashboard" : "/auth"}>{user ? "Open app" : "Sign in"}</Link></Button>
        </div>
      </header>
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Your AI-powered digital farm manager</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Track farms and crops, diagnose diseases from a photo, and get irrigation, fertilizer, yield and profit guidance — all in one place.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild size="lg"><Link to={user ? "/dashboard" : "/auth"}>Get started</Link></Button>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">
        {[
          { Icon: ScanLine, title: "Disease scanner", body: "Snap a photo of a leaf — AI identifies the disease and suggests treatment." },
          { Icon: Droplets, title: "Smart advisories", body: "Irrigation & fertilizer recommendations tailored to your soil and crop stage." },
          { Icon: TrendingUp, title: "Yield & profit", body: "Forecast yield and run profit scenarios before you plant." },
        ].map(({ Icon, title, body }) => (
          <div key={title} className="p-6 rounded-lg border bg-card">
            <Icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
