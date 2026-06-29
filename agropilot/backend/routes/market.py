from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database.session import get_db
from auth.security import get_current_user
from models import MarketPrice, User

router = APIRouter(prefix="/market", tags=["market"])

@router.get("/prices")
def prices(crop: str | None = Query(None),
           user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(MarketPrice)
    if crop: q = q.filter(MarketPrice.crop_name == crop)
    return [{"crop": p.crop_name, "market": p.market, "price": p.price, "updated_at": p.updated_at}
            for p in q.order_by(MarketPrice.updated_at.desc()).limit(200)]
