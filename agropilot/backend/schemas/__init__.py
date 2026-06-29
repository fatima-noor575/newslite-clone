from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ---------- auth ----------
class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    language: str = "en"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ForgotPasswordIn(BaseModel):
    email: EmailStr

# ---------- user ----------
class UserOut(BaseModel):
    id: int; name: str; email: EmailStr; role: str; language: str
    class Config: from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None

# ---------- farm ----------
class FarmIn(BaseModel):
    name: str; location: Optional[str] = None
    area: Optional[float] = None; soil_type: Optional[str] = None

class FarmOut(FarmIn):
    id: int
    class Config: from_attributes = True

# ---------- crop ----------
class CropIn(BaseModel):
    farm_id: int; crop_name: str
    planting_date: Optional[date] = None
    expected_harvest: Optional[date] = None

class CropOut(CropIn):
    id: int
    class Config: from_attributes = True

# ---------- AI ----------
class IrrigationIn(BaseModel):
    crop_id: int
    soil_moisture_pct: float = Field(ge=0, le=100)
    last_irrigation_days: int = Field(ge=0, le=60)

class IrrigationOut(BaseModel):
    water_amount_liters_per_acre: float
    recommendation: str
    next_schedule: date
    reasoning: str

class FertilizerIn(BaseModel):
    crop_id: int
    growth_stage: str  # seedling/vegetative/flowering/fruiting

class FertilizerOut(BaseModel):
    fertilizer_name: str; quantity_kg_per_acre: float
    application_date: date; safety_notes: str

class YieldIn(BaseModel):
    crop_id: int

class YieldOut(BaseModel):
    estimated_yield_kg_per_acre: float
    confidence: float
    trend: str

class ProfitIn(BaseModel):
    crop_id: int
    expected_price_per_kg: float
    expected_yield_kg: float
    extra_costs: float = 0

class ProfitOut(BaseModel):
    total_expenses: float
    estimated_revenue: float
    estimated_profit: float
    roi_pct: float
    break_even_price_per_kg: float

class ChatIn(BaseModel):
    message: str
    language: str = "en"

class ChatOut(BaseModel):
    answer: str

class DiseaseOut(BaseModel):
    disease_name: str
    confidence: float
    severity: str
    treatment: str
    prevention: str
    chemicals: List[str]

# ---------- weather ----------
class WeatherOut(BaseModel):
    temperature: float; humidity: float; rainfall_mm: float
    wind_kmh: float; description: str

# ---------- notifications ----------
class NotificationOut(BaseModel):
    id: int; type: str; message: str; status: str; created_at: datetime
    class Config: from_attributes = True
