"""Thin repository layer for DB access."""
from sqlalchemy.orm import Session
from models import User, Farm, Crop, Expense, Notification

class UserRepo:
    def __init__(self, db: Session): self.db = db
    def by_email(self, email): return self.db.query(User).filter(User.email == email).first()
    def by_id(self, uid): return self.db.query(User).get(uid)

class FarmRepo:
    def __init__(self, db: Session): self.db = db
    def list_for(self, user_id): return self.db.query(Farm).filter(Farm.user_id == user_id).all()
    def get_owned(self, fid, user_id):
        return self.db.query(Farm).filter(Farm.id == fid, Farm.user_id == user_id).first()

class CropRepo:
    def __init__(self, db: Session): self.db = db
    def for_user(self, user_id):
        return (self.db.query(Crop).join(Farm).filter(Farm.user_id == user_id).all())
    def get_owned(self, cid, user_id):
        return (self.db.query(Crop).join(Farm)
                .filter(Crop.id == cid, Farm.user_id == user_id).first())

class ExpenseRepo:
    def __init__(self, db: Session): self.db = db
    def total_for_crop(self, crop_id) -> float:
        rows = self.db.query(Expense).filter(Expense.crop_id == crop_id).all()
        return float(sum(r.amount or 0 for r in rows))

class NotificationRepo:
    def __init__(self, db: Session): self.db = db
    def create(self, user_id, type_, message):
        n = Notification(user_id=user_id, type=type_, message=message)
        self.db.add(n); self.db.commit(); self.db.refresh(n); return n
    def list_for(self, user_id):
        return self.db.query(Notification).filter(Notification.user_id == user_id)\
            .order_by(Notification.created_at.desc()).all()
