from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from auth.security import get_current_user
from schemas import CropIn, CropOut
from models import Crop, User
from repositories import CropRepo, FarmRepo

router = APIRouter(prefix="/crops", tags=["crops"])

@router.get("", response_model=list[CropOut])
def list_crops(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return CropRepo(db).for_user(user.id)

@router.post("", response_model=CropOut)
def create(body: CropIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    farm = FarmRepo(db).get_owned(body.farm_id, user.id)
    if not farm: raise HTTPException(404, "Farm not found")
    c = Crop(**body.model_dump()); db.add(c); db.commit(); db.refresh(c); return c

@router.patch("/{cid}", response_model=CropOut)
def update(cid: int, body: CropIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = CropRepo(db).get_owned(cid, user.id)
    if not c: raise HTTPException(404)
    for k, v in body.model_dump(exclude_none=True).items(): setattr(c, k, v)
    db.commit(); db.refresh(c); return c

@router.delete("/{cid}")
def delete(cid: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = CropRepo(db).get_owned(cid, user.id)
    if not c: raise HTTPException(404, "Crop not found")
    db.delete(c); db.commit()
    return {"ok": True}

