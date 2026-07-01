import { CloudSun, Droplets, Wind } from "lucide-react";

const sample = [
  { day: "Today", temp: 29, rain: 0, wind: 8, cond: "Sunny" },
  { day: "Tomorrow", temp: 27, rain: 2, wind: 12, cond: "Light showers" },
  { day: "Wed", temp: 26, rain: 8, wind: 10, cond: "Rain" },
  { day: "Thu", temp: 28, rain: 1, wind: 6, cond: "Cloudy" },
  { day: "Fri", temp: 31, rain: 0, wind: 5, cond: "Sunny" },
];

export default function Weather() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Weather</h1>
      <div className="mt-2 inline-block text-xs px-2 py-1 rounded bg-muted text-muted-foreground">Demo data — connect a weather API for live forecasts</div>
      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {sample.map(d => (
          <div key={d.day} className="p-4 rounded-lg border bg-card">
            <div className="font-medium">{d.day}</div>
            <CloudSun className="h-6 w-6 text-primary my-2" />
            <div className="text-2xl font-semibold">{d.temp}°</div>
            <div className="text-xs text-muted-foreground">{d.cond}</div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <Droplets className="h-3 w-3" />{d.rain}mm <Wind className="h-3 w-3 ml-1" />{d.wind}km/h
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
