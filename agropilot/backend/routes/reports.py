from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from database.session import get_db
from auth.security import get_current_user
from models import User
from repositories import FarmRepo, CropRepo
from services.ai.reports import build

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("")
def list_reports(user: User = Depends(get_current_user)):
    return [{"period": "daily"}, {"period": "weekly"}, {"period": "monthly"}]

@router.post("/generate")
def generate(period: str = "weekly", user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farms = FarmRepo(db).list_for(user.id)
    crops = CropRepo(db).for_user(user.id)
    sections = [
        ("Farms", [["ID","Name","Area","Soil"]] + [[str(f.id), f.name, str(f.area or "-"), f.soil_type or "-"] for f in farms]),
        ("Crops", [["ID","Crop","Planted","Harvest"]] + [[str(c.id), c.crop_name, str(c.planting_date or "-"), str(c.expected_harvest or "-")] for c in crops]),
    ]
    pdf = build(f"AgroPilot {period.title()} Report — {user.name}", sections)
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="report-{period}.pdf"'})
