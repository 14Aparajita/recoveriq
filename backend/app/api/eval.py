from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.event import Event
from ..models.outcome import Outcome
from ..models.decision import Decision
from ..models.user import User
from .auth import get_current_user

router = APIRouter(prefix="/api/eval", tags=["evaluation"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/cumulative")
def get_cumulative_reward(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    decisions = db.query(Decision).order_by(Decision.timestamp).all()
    rewards = []
    cumulative = 0.0
    for d in decisions:
        outcome = db.query(Outcome).filter_by(decision_id=d.id).first()
        if outcome:
            reward = outcome.revenue_recovered if outcome.recovered else 0.0
            cumulative += reward
            rewards.append({
                "step": len(rewards)+1,
                "reward": reward,
                "cumulative": cumulative
            })
    return {"data": rewards}