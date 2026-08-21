from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core.database import SessionLocal
from ..models.decision import Decision
from ..schemas.decision import DecisionResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[DecisionResponse])
def get_decisions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    decisions = db.query(Decision).offset(skip).limit(limit).all()
    return decisions