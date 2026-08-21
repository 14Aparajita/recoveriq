from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.event import Event
from ..models.outcome import Outcome
from ..models.decision import Decision
from sqlalchemy import func

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_events = db.query(Event).count()
    recovered_count = db.query(Outcome).filter(Outcome.recovered == 1).count()
    total_outcomes = db.query(Outcome).count()
    recovery_rate = (recovered_count / total_outcomes * 100) if total_outcomes > 0 else 0
    total_revenue = db.query(func.sum(Outcome.revenue_recovered)).scalar() or 0.0
    # Dummy baseline (in real, you'd compute from evaluation)
    baseline_rate = 35.0  # placeholder
    improvement = recovery_rate - baseline_rate
    recent_decisions = db.query(Decision).order_by(Decision.id.desc()).limit(5).all()
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