"""
COMPLEX FEATURE #2 — Smart Irrigation Recommendation
Combines soil moisture, recent rainfall, ET₀ (Hargreaves), and crop coefficient
to compute water requirement (L/acre) and next-irrigation date.
"""
from datetime import date, timedelta
from dataclasses import dataclass
from schemas import IrrigationOut

# crop coefficient (Kc) lookup — simplified FAO-56 averages
KC = {"wheat": 1.15, "rice": 1.20, "maize": 1.20, "cotton": 1.15,
      "sugarcane": 1.25, "tomato": 1.15, "potato": 1.15, "default": 1.0}

# Soil water-holding adjustment
SOIL_ADJ = {"sandy": 1.3, "loamy": 1.0, "clay": 0.8, "silty": 0.9}

@dataclass
class WeatherSnapshot:
    tmax_c: float; tmin_c: float; rh: float; rain_last_3d_mm: float; solar_radiation: float = 18.0

def hargreaves_et0(w: WeatherSnapshot) -> float:
    """Reference evapotranspiration (mm/day) — Hargreaves equation."""
    tmean = (w.tmax_c + w.tmin_c) / 2.0
    return 0.0023 * (tmean + 17.8) * ((w.tmax_c - w.tmin_c) ** 0.5) * w.solar_radiation

def compute(crop_name: str, soil_type: str, soil_moisture_pct: float,
            last_irrigation_days: int, weather: WeatherSnapshot) -> IrrigationOut:
    et0 = hargreaves_et0(weather)
    kc = KC.get(crop_name.lower(), KC["default"])
    etc_mm = et0 * kc  # crop water need (mm/day)

    # Effective water need after recent rain
    effective_mm = max(0.0, etc_mm * max(1, last_irrigation_days) - weather.rain_last_3d_mm)

    # Soil adjustment + moisture deficit factor
    soil_factor = SOIL_ADJ.get(soil_type.lower(), 1.0) if soil_type else 1.0
    moisture_deficit = max(0.0, (60.0 - soil_moisture_pct) / 60.0)  # 60% as field cap target
    adjusted_mm = effective_mm * soil_factor * (0.4 + 0.6 * moisture_deficit)

    # 1 mm over 1 acre ≈ 4047 liters
    liters_per_acre = round(adjusted_mm * 4047, 1)

    # Schedule
    days_until_next = 1 if soil_moisture_pct < 30 else (3 if soil_moisture_pct < 50 else 5)
    next_date = date.today() + timedelta(days=days_until_next)

    if liters_per_acre < 100:
        rec = "No irrigation needed — soil moisture is adequate."
    elif liters_per_acre < 8000:
        rec = "Light irrigation recommended."
    else:
        rec = "Full irrigation cycle required. Consider drip/sprinkler to reduce loss."

    reasoning = (
        f"ET0={et0:.2f} mm/day, Kc={kc}, ETc={etc_mm:.2f} mm/day, "
        f"rain_3d={weather.rain_last_3d_mm}mm, soil={soil_type or 'unknown'} "
        f"(factor={soil_factor}), moisture={soil_moisture_pct}% (deficit={moisture_deficit:.2f})."
    )
    return IrrigationOut(
        water_amount_liters_per_acre=liters_per_acre,
        recommendation=rec,
        next_schedule=next_date,
        reasoning=reasoning,
    )
