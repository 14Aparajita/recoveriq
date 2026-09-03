from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.event import Event
from ..models.decision import Decision
from ..models.merchant import Merchant
from ..models.alert import Alert
from .auth import get_current_user
from ..models.user import User
from ..services.razorpay_service import create_payment_link
import random

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/retry/{event_id}")
def execute_retry(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter_by(id=event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    # Verify the event belongs to a merchant of this user
    merchant = db.query(Merchant).filter_by(id=event.merchant_id, user_id=current_user.id).first()
    if not merchant:
        raise HTTPException(403, "Access denied")

    try:
        link = create_payment_link(event.order_id, event.amount)
        short_url = link.get("short_url")
        payment_link_id = link.get("id")

        decision = Decision(
            event_id=event.id,
            action="retry_now",
            justification="Manual retry triggered via dashboard",
            confidence=0.8,
            llm_used=0
        )
        db.add(decision)
        db.commit()
        db.refresh(decision)

        # Create an alert for the user
        alert = Alert(
            user_id=current_user.id,
            event_id=event.id,
            decision_id=decision.id,
            type="recovery_attempt",
            message=f"Payment link created for order {event.order_id}: {short_url}"
        )
        db.add(alert)
        db.commit()

        return {
            "status": "success",
            "payment_link": short_url,
            "payment_link_id": payment_link_id,
            "decision_id": decision.id
        }
    except Exception as e:
        raise HTTPException(500, f"Retry failed: {str(e)}")