from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.event import Event
from ..models.outcome import Outcome
from ..models.decision import Decision
from ..models.merchant import Merchant
from .auth import get_current_user
from ..models.user import User
from sqlalchemy import func

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard")
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    merchant_ids = [m.id for m in db.query(Merchant).filter_by(user_id=current_user.id).all()]
    if not merchant_ids:
        return {
            "recovery_rate": 0,
            "revenue_recovered": 0.0,
            "baseline_rate": 35.0,
            "improvement": -35.0,
            "recent_decisions": []
        }
    # Filter events by merchant_ids
    total_events = db.query(Event).filter(Event.merchant_id.in_(merchant_ids)).count()
    # Outcomes are linked via Decision -> Event
    outcomes = db.query(Outcome).join(Decision).join(Event).filter(Event.merchant_id.in_(merchant_ids)).all()
    recovered_count = sum(1 for o in outcomes if o.recovered)
    total_outcomes = len(outcomes)
    recovery_rate = (recovered_count / total_outcomes * 100) if total_outcomes > 0 else 0
    total_revenue = db.query(func.sum(Outcome.revenue_recovered)).join(Decision).join(Event).filter(Event.merchant_id.in_(merchant_ids)).scalar() or 0.0
    baseline_rate = 35.0  # fixed baseline
    improvement = recovery_rate - baseline_rate
    recent_decisions = db.query(Decision).join(Event).filter(Event.merchant_id.in_(merchant_ids)).order_by(Decision.id.desc()).limit(10).all()
    return {
        "recovery_rate": round(recovery_rate, 2),
        "revenue_recovered": round(total_revenue, 2),
        "baseline_rate": baseline_rate,
        "improvement": round(improvement, 2),
        "recent_decisions": [
            {"id": d.id, "event_id": d.event_id, "action": d.action, "justification": d.justification}
            for d in recent_decisions
        ]
    }