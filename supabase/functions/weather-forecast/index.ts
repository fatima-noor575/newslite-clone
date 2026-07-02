import { corsHeaders } from "../_shared/cors.ts";

/**
 * Weather forecast via Open-Meteo (no API key required).
 * Input: { location: string }  — either "lat,lon" OR a place name like "Lahore".
 * Output: {
 *   place: { name, lat, lon, country },
 *   current: { temp, humidity, wind_kmh, rain_mm, code, description },
 *   daily: [{ date, tmax, tmin, rain_mm, wind_kmh, code, description }],
 *   advice: string[]
 * }
 */

const WMO: Record<number, string> = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Heavy freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Heavy showers", 82: "Violent showers",
  95: "Thunderstorm", 96: "Thunderstorm w/ hail", 99: "Severe thunderstorm",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const location: string = (body.location || "").toString().trim();
    if (!location) return json({ error: "location required" }, 400);

    // Parse "lat,lon" or geocode a name
    let lat: number, lon: number, place = { name: location, country: "" as string };
    const m = location.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (m) {
      lat = parseFloat(m[1]); lon = parseFloat(m[2]);
      place = { name: `${lat.toFixed(3)}, ${lon.toFixed(3)}`, country: "" };
    } else {
      const geo = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
      ).then(r => r.json());
      const hit = geo?.results?.[0];
      if (!hit) return json({ error: `Could not find "${location}"` }, 404);
      lat = hit.latitude; lon = hit.longitude;
      place = { name: hit.name, country: hit.country || "" };
    }

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code");
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("wind_speed_unit", "kmh");

    const res = await fetch(url);
    if (!res.ok) return json({ error: `Open-Meteo ${res.status}` }, 502);
    const d = await res.json();

    const c = d.current || {};
    const current = {
      temp: c.temperature_2m, humidity: c.relative_humidity_2m,
      wind_kmh: c.wind_speed_10m, rain_mm: c.precipitation ?? 0,
      code: c.weather_code, description: WMO[c.weather_code] ?? "—",
    };
    const daily = (d.daily?.time || []).map((t: string, i: number) => ({
      date: t,
      code: d.daily.weather_code[i],
      description: WMO[d.daily.weather_code[i]] ?? "—",
      tmax: d.daily.temperature_2m_max[i],
      tmin: d.daily.temperature_2m_min[i],
      rain_mm: d.daily.precipitation_sum[i] ?? 0,
      wind_kmh: d.daily.wind_speed_10m_max[i] ?? 0,
    }));

    const advice: string[] = [];
    const totalRain7d = daily.reduce((s: number, x: any) => s + (x.rain_mm || 0), 0);
    if (current.rain_mm > 2 || totalRain7d > 15) advice.push("Postpone irrigation — significant rainfall expected.");
    if (current.temp > 35) advice.push("Heat stress risk — irrigate at dawn or dusk and consider mulching.");
    if (current.humidity > 80) advice.push("High humidity — monitor for fungal disease (blight, rust, mildew).");
    if (current.wind_kmh > 25) advice.push("Strong wind — delay foliar spraying to avoid drift.");
    if (daily.some((x: any) => x.tmin < 2)) advice.push("Frost risk in the next 7 days — protect sensitive crops.");
    if (advice.length === 0) advice.push("Conditions look favourable for routine field operations.");

    return json({ place: { ...place, lat, lon }, current, daily, advice });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
