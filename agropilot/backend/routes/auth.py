from datetime import datetime, timedelta
import hashlib, secrets
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from database.session import get_db
from models import User, RefreshToken
from schemas import RegisterIn, LoginIn, TokenOut, ForgotPasswordIn, UserOut
from auth.security import (hash_password, verify_password, create_access_token,
                           create_refresh_token, decode_token, get_current_user)
from config.settings import settings

router = APIRouter(prefix="/auth", tags=["auth"])

def _store_refresh(db, user, token):
    h = hashlib.sha256(token.encode()).hexdigest()
    db.add(RefreshToken(user_id=user.id, token_hash=h,
        expires_at=datetime.utcnow()+timedelta(days=settings.REFRESH_TTL_DAYS)))
    db.commit()

def _set_cookies(resp: Response, access: str, refresh: str):
    resp.set_cookie("access_token", access, httponly=True, secure=True, samesite="lax",
                    max_age=settings.ACCESS_TTL_MIN*60)
    resp.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="lax",
                    max_age=settings.REFRESH_TTL_DAYS*86400, path="/auth/refresh")

@router.post("/register", response_model=UserOut)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")
    u = User(name=body.name, email=body.email, language=body.language,
             password_hash=hash_password(body.password))
    db.add(u); db.commit(); db.refresh(u)
    # TODO: send email verification (token via SMTP)
    return u

@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, response: Response, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == body.email).first()
    if not u or not verify_password(body.password, u.password_hash):
        raise HTTPException(401, "Invalid credentials")
    access = create_access_token(u.email); refresh = create_refresh_token(u.email)
    _store_refresh(db, u, refresh); _set_cookies(response, access, refresh)
    return TokenOut(access_token=access)

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/auth/refresh")
    return {"ok": True}

@router.post("/refresh", response_model=TokenOut)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    tok = request.cookies.get("refresh_token")
    if not tok: raise HTTPException(401, "Missing refresh token")
    payload = decode_token(tok, refresh=True)
    h = hashlib.sha256(tok.encode()).hexdigest()
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == h, RefreshToken.revoked == False).first()
    if not rt: raise HTTPException(401, "Refresh token revoked")
    # rotate
    rt.revoked = True
    user = db.query(User).filter(User.email == payload["sub"]).first()
    new_refresh = create_refresh_token(user.email)
    _store_refresh(db, user, new_refresh)
    access = create_access_token(user.email)
    _set_cookies(response, access, new_refresh)
    return TokenOut(access_token=access)

@router.post("/forgot-password")
def forgot(body: ForgotPasswordIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == body.email).first()
    # Don't leak which emails exist
    if u:
        token = secrets.token_urlsafe(32)
        # TODO: persist + email reset link via SMTP
    return {"ok": True}
