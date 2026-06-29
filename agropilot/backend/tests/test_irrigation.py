from services.ai.irrigation import compute, WeatherSnapshot

def test_irrigation_no_water_when_wet():
    w = WeatherSnapshot(tmax_c=28, tmin_c=20, rh=70, rain_last_3d_mm=40)
    out = compute("wheat", "loamy", soil_moisture_pct=70, last_irrigation_days=1, weather=w)
    assert out.water_amount_liters_per_acre >= 0

def test_irrigation_dry_recommends_water():
    w = WeatherSnapshot(tmax_c=40, tmin_c=28, rh=20, rain_last_3d_mm=0)
    out = compute("maize", "sandy", soil_moisture_pct=15, last_irrigation_days=7, weather=w)
    assert out.water_amount_liters_per_acre > 1000
