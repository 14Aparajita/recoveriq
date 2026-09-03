from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core.database import SessionLocal
from ..models.decision import Decision
from ..models.event import Event
from ..models.merchant import Merchant
from ..schemas.decision import DecisionResponse
from .auth import get_current_user
from ..models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[DecisionResponse])
def get_decisions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    merchant_ids = [m.id for m in db.query(Merchant).filter_by(user_id=current_user.id).all()]
    if not merchant_ids:
        return []
    # Join with Event to filter by merchant_id
    decisions = db.query(Decision).join(Event).filter(Event.merchant_id.in_(merchant_ids)).offset(skip).limit(limit).all()
    return decisions