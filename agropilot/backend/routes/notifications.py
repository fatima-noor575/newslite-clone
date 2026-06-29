from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from auth.security import get_current_user
from models import User
from repositories import NotificationRepo
from schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=list[NotificationOut])
def list_n(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return NotificationRepo(db).list_for(user.id)
