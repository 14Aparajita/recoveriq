from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.decision import Decision
from ..services.razorpay_service import create_payment_link
from ..services.audit_service import log_outcome
import random

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/retry/{event_id}")
def execute_retry(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    
    # Create Razorpay Payment Link
    try:
        link = create_payment_link(event.order_id, event.amount)
        
        # Log decision
        decision = Decision(
            event_id=event.id,
            action="retry_now",
            justification="Manual retry triggered via dashboard",
            confidence=0.8,
            llm_used=0
        )
        db.add(decision)
        db.commit()
        
        return {
            "status": "success",
            "payment_link": link.get("short_url"),
            "payment_link_id": link.get("id"),
            "decision_id": decision.id
        }
    except Exception as e:
        raise HTTPException(500, f"Retry failed: {str(e)}")