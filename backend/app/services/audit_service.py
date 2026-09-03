from sqlalchemy.orm import Session
from ..models.outcome import Outcome
from ..models.decision import Decision

def log_outcome(decision_id: int, success: bool, amount: float, razorpay_payment_id: str = None):
    from ..core.database import SessionLocal
    db = SessionLocal()
    try:
        outcome = Outcome(
            decision_id=decision_id,
            recovered=1 if success else 0,
            revenue_recovered=amount if success else 0.0,
            razorpay_payment_id=razorpay_payment_id,
            time_to_recovery=0.5  # dummy value, could be calculated
        )
        db.add(outcome)
        db.commit()
        db.refresh(outcome)
        return outcome
    finally:
        db.close()

def get_decision_by_payment_link(payment_link_id: str):
    # In a real implementation, you would store payment_link_id on Decision.
    # For demo, we return the most recent decision.
    from ..core.database import SessionLocal
    db = SessionLocal()
    try:
        decision = db.query(Decision).order_by(Decision.id.desc()).first()
        return decision.id if decision else None
    finally:
        db.close()