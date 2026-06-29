"""SQLAlchemy ORM models — full schema per spec."""
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
import enum
from database.session import Base


class Role(str, enum.Enum):
    FARMER = "farmer"
    CONSULTANT = "consultant"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    language = Column(String(8), default="en")  # en | ur | pn
    role = Column(Enum(Role), default=Role.FARMER, nullable=False)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    farms = relationship("Farm", back_populates="user", cascade="all,delete")


class Farm(Base):
    __tablename__ = "farms"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(120), nullable=False)
    location = Column(String(255))         # "lat,lon" or address
    area = Column(Float)                   # acres
    soil_type = Column(String(60))
    user = relationship("User", back_populates="farms")
    crops = relationship("Crop", back_populates="farm", cascade="all,delete")


class Crop(Base):
    __tablename__ = "crops"
    id = Column(Integer, primary_key=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"))
    crop_name = Column(String(80), nullable=False)
    planting_date = Column(Date)
    expected_harvest = Column(Date)
    farm = relationship("Farm", back_populates="crops")


class DiseaseRecord(Base):
    __tablename__ = "disease_records"
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    image_url = Column(String(500))
    disease_name = Column(String(120))
    confidence = Column(Float)
    severity = Column(String(20))  # low/medium/high
    recommendations = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class WeatherLog(Base):
    __tablename__ = "weather_logs"
    id = Column(Integer, primary_key=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"))
    temperature = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    forecast_date = Column(Date)


class IrrigationSchedule(Base):
    __tablename__ = "irrigation_schedules"
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    recommendation = Column(Text)
    water_amount = Column(Float)  # liters / acre
    schedule_date = Column(Date)


class FertilizerPlan(Base):
    __tablename__ = "fertilizer_plans"
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    fertilizer_name = Column(String(120))
    quantity = Column(Float)  # kg / acre
    application_date = Column(Date)


class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    category = Column(String(60))
    amount = Column(Float)


class YieldPrediction(Base):
    __tablename__ = "yield_predictions"
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    estimated_yield = Column(Float)  # kg / acre
    confidence = Column(Float)


class ProfitPrediction(Base):
    __tablename__ = "profit_predictions"
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    estimated_revenue = Column(Float)
    estimated_profit = Column(Float)


class MarketPrice(Base):
    __tablename__ = "market_prices"
    id = Column(Integer, primary_key=True)
    crop_name = Column(String(80), index=True)
    market = Column(String(120))
    price = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow)


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"))
    title = Column(String(200))
    priority = Column(String(20))  # low/medium/high
    due_date = Column(Date)
    completed = Column(Boolean, default=False)


class AIChatHistory(Base):
    __tablename__ = "ai_chat_history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    question = Column(Text)
    answer = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(40))   # rain/disease/irrigation/fertilizer/market
    message = Column(Text)
    status = Column(String(20), default="unread")
    created_at = Column(DateTime, default=datetime.utcnow)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token_hash = Column(String(255), unique=True, index=True)
    expires_at = Column(DateTime)
    revoked = Column(Boolean, default=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(120))
    detail = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
