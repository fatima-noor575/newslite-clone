from datetime import date
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from auth.security import get_current_user
from models import (User, Crop, Farm, DiseaseRecord, IrrigationSchedule,
                    FertilizerPlan, YieldPrediction, ProfitPrediction, AIChatHistory)
from repositories import CropRepo, ExpenseRepo
from schemas import (DiseaseOut, IrrigationIn, IrrigationOut, FertilizerIn, FertilizerOut,
                     YieldIn, YieldOut, ProfitIn, ProfitOut, ChatIn, ChatOut)
from services.ai import disease_detection, irrigation as irr_svc, profit as profit_svc
from services.ai import chat as chat_svc
from services.ai.irrigation import WeatherSnapshot

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/disease-detect", response_model=DiseaseOut)
async def disease(crop_id: int = Form(...), file: UploadFile = File(...),
                  user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = CropRepo(db).get_owned(crop_id, user.id)
    if not crop: raise HTTPException(404, "Crop not found")
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(400, "Unsupported image type")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024: raise HTTPException(413, "Image too large")
    result = disease_detection.detect_from_bytes(data, file.content_type, crop.crop_name)
    db.add(DiseaseRecord(crop_id=crop.id, disease_name=result.disease_name,
                         confidence=result.confidence, severity=result.severity,
                         recommendations=result.treatment))
    db.commit()
    return result

@router.post("/irrigation", response_model=IrrigationOut)
def irrigation(body: IrrigationIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = CropRepo(db).get_owned(body.crop_id, user.id)
    if not crop: raise HTTPException(404)
    farm = db.query(Farm).get(crop.farm_id)
    # Placeholder weather snapshot — production: fetch from weather service
    w = WeatherSnapshot(tmax_c=34, tmin_c=22, rh=55, rain_last_3d_mm=0)
    out = irr_svc.compute(crop.crop_name, farm.soil_type or "loamy",
                          body.soil_moisture_pct, body.last_irrigation_days, w)
    db.add(IrrigationSchedule(crop_id=crop.id, recommendation=out.recommendation,
                              water_amount=out.water_amount_liters_per_acre,
                              schedule_date=out.next_schedule))
    db.commit()
    return out

@router.post("/fertilizer", response_model=FertilizerOut)
def fertilizer(body: FertilizerIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = CropRepo(db).get_owned(body.crop_id, user.id)
    if not crop: raise HTTPException(404)
    plan = {"seedling": ("DAP", 50), "vegetative": ("Urea", 60),
            "flowering": ("NPK 20-20-20", 40), "fruiting": ("Potash (MOP)", 30)}
    name, qty = plan.get(body.growth_stage.lower(), ("NPK 15-15-15", 45))
    fp = FertilizerPlan(crop_id=crop.id, fertilizer_name=name, quantity=qty, application_date=date.today())
    db.add(fp); db.commit()
    return FertilizerOut(fertilizer_name=name, quantity_kg_per_acre=qty,
                         application_date=date.today(),
                         safety_notes="Apply during cool hours; wear PPE; avoid before rain.")

@router.post("/yield", response_model=YieldOut)
def yield_predict(body: YieldIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = CropRepo(db).get_owned(body.crop_id, user.id)
    if not crop: raise HTTPException(404)
    base = {"wheat": 1500, "rice": 2200, "maize": 2800, "cotton": 900}.get(crop.crop_name.lower(), 1500)
    out = YieldOut(estimated_yield_kg_per_acre=base, confidence=0.75, trend="stable")
    db.add(YieldPrediction(crop_id=crop.id, estimated_yield=out.estimated_yield_kg_per_acre,
                           confidence=out.confidence)); db.commit()
    return out

@router.post("/profit", response_model=ProfitOut)
def profit(body: ProfitIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crop = CropRepo(db).get_owned(body.crop_id, user.id)
    if not crop: raise HTTPException(404)
    total_exp = ExpenseRepo(db).total_for_crop(crop.id)
    out = profit_svc.compute(profit_svc.ProfitInputs(
        total_expenses=total_exp, expected_yield_kg=body.expected_yield_kg,
        expected_price_per_kg=body.expected_price_per_kg, extra_costs=body.extra_costs))
    db.add(ProfitPrediction(crop_id=crop.id, estimated_revenue=out.estimated_revenue,
                            estimated_profit=out.estimated_profit)); db.commit()
    return out

@router.post("/chat", response_model=ChatOut)
def chat(body: ChatIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ans = chat_svc.ask(body.message, body.language or user.language)
    db.add(AIChatHistory(user_id=user.id, question=body.message, answer=ans)); db.commit()
    return ChatOut(answer=ans)
