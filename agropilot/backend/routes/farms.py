from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from auth.security import get_current_user
from schemas import FarmIn, FarmOut
from models import Farm, User
from repositories import FarmRepo

router = APIRouter(prefix="/farms", tags=["farms"])

@router.get("", response_model=list[FarmOut])
def list_farms(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return FarmRepo(db).list_for(user.id)

@router.post("", response_model=FarmOut)
def create(body: FarmIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = Farm(user_id=user.id, **body.model_dump())
    db.add(f); db.commit(); db.refresh(f); return f

@router.patch("/{fid}", response_model=FarmOut)
def update(fid: int, body: FarmIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = FarmRepo(db).get_owned(fid, user.id)
    if not f: raise HTTPException(404)
    for k, v in body.model_dump(exclude_none=True).items(): setattr(f, k, v)
    db.commit(); db.refresh(f); return f

@router.delete("/{fid}")
def delete(fid: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = FarmRepo(db).get_owned(fid, user.id)
    if not f: raise HTTPException(404)
    db.delete(f); db.commit(); return {"ok": True}
