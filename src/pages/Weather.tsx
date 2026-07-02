import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudSun, Droplets, Wind, Thermometer, MapPin, Search, Sparkles, Cloud, CloudRain, Sun, CloudSnow, CloudLightning } from "lucide-react";
import { toast } from "sonner";

type Farm = { id: string; name: string; location: string | null };
type Forecast = {
  place: { name: string; country: string; lat: number; lon: number };
  current: { temp: number; humidity: number; wind_kmh: number; rain_mm: number; code: number; description: string };
  daily: { date: string; code: number; description: string; tmax: number; tmin: number; rain_mm: number; wind_kmh: number }[];
  advice: string[];
};

function iconFor(code: number) {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3 || code === 45 || code === 48) return Cloud;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 95) return CloudLightning;
  return CloudSun;
}

export default function Weather() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmId, setFarmId] = useState<string>("");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Forecast | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("farms").select("id, name, location").order("created_at", { ascending: false });
      const list = (data ?? []) as Farm[];
      setFarms(list);
      const withLoc = list.find(f => f.location);
      if (withLoc) { setFarmId(withLoc.id); await fetchFor(withLoc.location!); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFor = async (location: string) => {
    if (!location) return toast.error("Enter a location or select a farm with a location.");
    setBusy(true); setData(null);
    try {
      const { data, error } = await supabase.functions.invoke("weather-forecast", { body: { location } });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setData(data as Forecast);
    } catch (e: any) {
      toast.error(e.message || "Failed to load weather");
    } finally { setBusy(false); }
  };

  const onFarmChange = (id: string) => {
    setFarmId(id);
    const f = farms.find(x => x.id === id);
    if (f?.location) fetchFor(f.location);
    else toast.error("This farm has no location. Add one in Farm details, or type a place below.");
  };

  const CurrentIcon = data ? iconFor(data.current.code) : CloudSun;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Weather</h1>
          <p className="text-muted-foreground mt-1">Live forecast and farming advisories powered by Open-Meteo.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end p-4 rounded-2xl border border-border bg-card shadow-elev-sm">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Farm</label>
          {farms.length > 0 ? (
            <Select value={farmId} onValueChange={onFarmChange}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select a farm" /></SelectTrigger>
              <SelectContent>
                {farms.map(f => (
                  <SelectItem key={f.id} value={f.id}>{f.name} {f.location ? `· ${f.location}` : "(no location)"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">Add farms with a location to auto-load.</div>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Or place / lat,lon</label>
          <Input
            className="mt-1"
            placeholder="e.g. Lahore  or  31.5,74.35"
            value={manual}
            onChange={e => setManual(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchFor(manual)}
          />
        </div>
        <Button onClick={() => fetchFor(manual)} disabled={busy || !manual} className="bg-gradient-primary">
          <Search className="h-4 w-4 mr-2" />{busy ? "Loading…" : "Get forecast"}
        </Button>
      </div>

      {busy && <div className="mt-8 text-muted-foreground">Fetching live weather…</div>}

      {data && (
        <>
          {/* Current */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="p-8 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elev-lg relative overflow-hidden">
              <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/80">
                  <MapPin className="h-3 w-3" /> {data.place.name}{data.place.country && `, ${data.place.country}`}
                </div>
                <div className="mt-4 flex items-end gap-6 flex-wrap">
                  <div>
                    <div className="font-display text-7xl font-semibold tabular-nums leading-none">
                      {Math.round(data.current.temp)}°
                    </div>
                    <div className="mt-2 text-primary-foreground/85">{data.current.description}</div>
                  </div>
                  <CurrentIcon className="h-24 w-24 text-accent" strokeWidth={1.2} />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                  <Stat Icon={Droplets} label="Humidity" value={`${data.current.humidity}%`} />
                  <Stat Icon={Wind} label="Wind" value={`${Math.round(data.current.wind_kmh)} km/h`} />
                  <Stat Icon={CloudRain} label="Rain" value={`${data.current.rain_mm ?? 0} mm`} />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card shadow-elev-sm">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-accent" /> Farming advisories
              </div>
              <ul className="mt-3 space-y-2">
                {data.advice.map((a, i) => (
                  <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                    <span className="text-primary mt-1">•</span><span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7-day forecast */}
          <h2 className="font-display text-lg font-semibold mt-10">7-day forecast</h2>
          <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {data.daily.map((d, i) => {
              const Icon = iconFor(d.code);
              const day = new Date(d.date).toLocaleDateString(undefined, { weekday: "short" });
              return (
                <div
                  key={d.date}
                  className="p-4 rounded-xl border border-border bg-gradient-card shadow-elev-sm text-center animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {i === 0 ? "Today" : day}
                  </div>
                  <Icon className="h-8 w-8 mx-auto my-3 text-primary" strokeWidth={1.5} />
                  <div className="text-sm font-semibold">{Math.round(d.tmax)}° <span className="text-muted-foreground font-normal">/ {Math.round(d.tmin)}°</span></div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">{d.description}</div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-0.5"><Droplets className="h-3 w-3" />{d.rain_mm}</span>
                    <span className="inline-flex items-center gap-0.5"><Wind className="h-3 w-3" />{Math.round(d.wind_kmh)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!data && !busy && (
        <div className="mt-10 p-10 rounded-2xl border border-dashed border-border bg-card/50 text-center">
          <CloudSun className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="mt-3 text-muted-foreground">Select a farm or enter a place to see the live 7-day forecast.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ Icon, label, value }: { Icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-9 w-9 rounded-lg bg-primary-foreground/15 grid place-items-center">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-primary-foreground/70">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}
