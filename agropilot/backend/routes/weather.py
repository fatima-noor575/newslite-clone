from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.session import get_db
from auth.security import get_current_user
from models import User
from repositories import FarmRepo
from services.ai import weather as wx

router = APIRouter(prefix="/weather", tags=["weather"])

@router.get("/current")
async def current(farm_id: int = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = FarmRepo(db).get_owned(farm_id, user.id)
    if not farm: raise HTTPException(404)
    snap = await wx.current(farm.location or "")
    return {**snap, "advice": wx.to_advice(snap)}

@router.get("/forecast")
async def forecast(farm_id: int = Query(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = FarmRepo(db).get_owned(farm_id, user.id)
    if not farm: raise HTTPException(404)
    return await wx.forecast(farm.location or "")
