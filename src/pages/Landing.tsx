import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, ScanLine, Droplets, TrendingUp, CloudSun, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  const cta = user ? "/dashboard" : "/auth";

  return (
    <div className="min-h-screen bg-hero text-foreground overflow-hidden">
      {/* Nav */}
      <header className="border-b border-border/60 glass sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display font-semibold tracking-tight leading-none">AgroPilot</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Digital Farm</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
            <Button asChild className="bg-gradient-primary shadow-elev-md hover:shadow-glow transition-shadow">
              <Link to={cta}>{user ? "Open app" : "Get started"} <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 text-xs text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-accent" /> Powered by Lovable AI
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02]">
            The intelligent
            <br />
            <span className="text-gradient-primary">farm operating system.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Diagnose crop disease from a photo. Get irrigation, fertilizer and yield guidance
            grounded in your soil, weather and history — all in one modern workspace.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-elev-lg hover:shadow-glow h-12 px-6 text-base">
              <Link to={cta}>Start free <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base bg-card/60 backdrop-blur-sm">
              <Link to="/auth">Book a demo</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {["No card required", "Real weather forecasts", "Multilingual (EN / اردو / ਪੰਜਾਬੀ)"].map(l => (
              <span key={l} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { Icon: ScanLine, title: "Disease scanner", body: "Photo-based diagnosis with treatment plans in seconds." },
            { Icon: Droplets, title: "Smart advisories", body: "Irrigation & NPK plans tuned to soil and growth stage." },
            { Icon: CloudSun, title: "Live weather", body: "7-day forecast at your farm's exact coordinates." },
            { Icon: TrendingUp, title: "Yield & profit", body: "Forecast harvests, model ROI, export PDF reports." },
          ].map(({ Icon, title, body }, i) => (
            <div
              key={title}
              className="group p-6 rounded-2xl border border-border bg-gradient-card shadow-elev-sm hover:shadow-elev-md hover:-translate-y-0.5 transition-all animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl p-10 md:p-16 bg-gradient-primary text-primary-foreground shadow-elev-lg relative overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight max-w-xl">
              Ready to run your farm with clarity?
            </h2>
            <p className="mt-3 text-primary-foreground/80 max-w-xl">
              Sign up and add your first farm in under a minute.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8 h-12 px-6 text-base shadow-elev-md">
              <Link to={cta}>Get started free <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AgroPilot · Cultivate with intelligence.
      </footer>
    </div>
  );
}
