from sqlalchemy.orm import Session
from ..models.outcome import Outcome
from ..models.decision import Decision

def log_outcome(decision_id: int, success: bool, amount: float, razorpay_payment_id: str = None):
    """
    Record the outcome of a recovery action.
    """
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
    """
    Look up the decision associated with a payment link.
    Since we don't have a direct mapping yet, we'll implement a stub.
    In a real implementation, you would store the payment_link_id on the Decision model.
    """
    # For now, return a dummy decision ID (e.g., 1) – but this is just to avoid crashes.
    # You'll need to properly implement this when you integrate the full flow.
    # For demonstration, we'll query the most recent decision.
    from ..core.database import SessionLocal
    from ..models.decision import Decision
    db = SessionLocal()
    try:
        # Find the most recent decision that hasn't been associated yet
        decision = db.query(Decision).order_by(Decision.id.desc()).first()
        if decision:
            return decision.id
        return None
    finally:
        db.close()