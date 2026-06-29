from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database.session import get_db
from models import User, Role
from config.settings import settings

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def hash_password(pw: str) -> str:
    return pwd_ctx.hash(pw)


def verify_password(pw: str, h: str) -> bool:
    return pwd_ctx.verify(pw, h)


def create_access_token(sub: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TTL_MIN)
    return jwt.encode({"sub": sub, "exp": exp, "type": "access"}, settings.JWT_SECRET, algorithm="HS256")


def create_refresh_token(sub: str) -> str:
    exp = datetime.utcnow() + timedelta(days=settings.REFRESH_TTL_DAYS)
    return jwt.encode({"sub": sub, "exp": exp, "type": "refresh"}, settings.JWT_REFRESH_SECRET, algorithm="HS256")


def decode_token(token: str, refresh: bool = False) -> dict:
    secret = settings.JWT_REFRESH_SECRET if refresh else settings.JWT_SECRET
    try:
        return jwt.decode(token, secret, algorithms=["HS256"])
    except JWTError as e:
        raise HTTPException(401, f"Invalid token: {e}")


def get_current_user(
    request: Request,
    token: Optional[str] = Depends(oauth2),
    db: Session = Depends(get_db),
) -> User:
    # Accept either bearer or HttpOnly cookie
    tok = token or request.cookies.get("access_token")
    if not tok:
        raise HTTPException(401, "Not authenticated")
    payload = decode_token(tok)
    user = db.query(User).filter(User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(401, "User not found")
    return user


def require_role(*roles: Role):
    def dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, "Forbidden")
        return user
    return dep
