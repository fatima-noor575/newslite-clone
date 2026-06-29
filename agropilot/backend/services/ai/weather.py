"""OpenWeatherMap integration with farming-advice mapping."""
import httpx
from config.settings import settings

BASE = "https://api.openweathermap.org/data/2.5"

def _parse_latlon(location: str):
    try:
        lat, lon = [float(x) for x in location.split(",")[:2]]
        return lat, lon
    except Exception:
        return 31.5204, 74.3587  # Lahore default

async def current(location: str):
    lat, lon = _parse_latlon(location)
    async with httpx.AsyncClient(timeout=10) as h:
        r = await h.get(f"{BASE}/weather", params={
            "lat": lat, "lon": lon, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"})
        r.raise_for_status(); d = r.json()
    return {
        "temperature": d["main"]["temp"], "humidity": d["main"]["humidity"],
        "rainfall_mm": d.get("rain", {}).get("1h", 0),
        "wind_kmh": d["wind"]["speed"] * 3.6,
        "description": d["weather"][0]["description"],
    }

async def forecast(location: str):
    lat, lon = _parse_latlon(location)
    async with httpx.AsyncClient(timeout=10) as h:
        r = await h.get(f"{BASE}/forecast", params={
            "lat": lat, "lon": lon, "appid": settings.OPENWEATHER_API_KEY,
            "units": "metric", "cnt": 56})  # ~7 days, 3h steps
        r.raise_for_status()
        return r.json()

def to_advice(snapshot: dict) -> str:
    advice = []
    if snapshot["rainfall_mm"] > 5: advice.append("Postpone irrigation — rain expected/occurring.")
    if snapshot["temperature"] > 35: advice.append("Heat stress risk — irrigate at dawn/dusk.")
    if snapshot["humidity"] > 80: advice.append("High humidity — monitor for fungal disease.")
    if snapshot["wind_kmh"] > 25: advice.append("Strong wind — delay foliar spraying.")
    return " ".join(advice) or "Conditions normal."
