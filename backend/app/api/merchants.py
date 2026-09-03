from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.merchant import Merchant
from .auth import get_current_user
from ..models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/api/merchants", tags=["merchants"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class MerchantCreate(BaseModel):
    name: str
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

@router.get("/")
def get_merchants(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    merchants = db.query(Merchant).filter_by(user_id=current_user.id).all()
    return [{"id": m.id, "name": m.name} for m in merchants]

@router.post("/")
def create_merchant(data: MerchantCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    merchant = Merchant(user_id=current_user.id, name=data.name, razorpay_key_id=data.razorpay_key_id, razorpay_key_secret=data.razorpay_key_secret)
    db.add(merchant)
    db.commit()
    db.refresh(merchant)
    return {"id": merchant.id, "name": merchant.name}

@router.delete("/{merchant_id}")
def delete_merchant(merchant_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    merchant = db.query(Merchant).filter_by(id=merchant_id, user_id=current_user.id).first()
    if not merchant:
        raise HTTPException(404, "Merchant not found")
    db.delete(merchant)
    db.commit()
    return {"msg": "Deleted"}