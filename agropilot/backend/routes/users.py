from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from auth.security import get_current_user
from schemas import UserOut, UserUpdate
from models import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)): return user

@router.patch("/me", response_model=UserOut)
def update_me(body: UserUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for k, v in body.model_dump(exclude_none=True).items(): setattr(user, k, v)
    db.commit(); db.refresh(user); return user
