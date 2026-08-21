from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from ..core.database import SessionLocal
from ..services.razorpay_service import verify_payment_signature
from ..services.audit_service import log_outcome, get_decision_by_payment_link
from ..ai.policy import update_segment_stats
import json

router = APIRouter(prefix="/webhooks/razorpay", tags=["webhooks"])

@router.post("/")
async def razorpay_webhook(request: Request, background_tasks: BackgroundTasks):
    body = await request.body()
    payload = json.loads(body)
    
    # For demo, skip signature verification
    # In production: verify with razorpay webhook secret
    
    # Process in background
    background_tasks.add_task(process_webhook_event, payload)
    return {"status": "accepted"}

def process_webhook_event(payload: dict):
    event = payload.get("event")
    if event not in ["payment_link.paid", "payment_link.failed"]:
        return
    
    payment_link = payload.get("payload", {}).get("payment_link", {}).get("entity", {})
    payment_link_id = payment_link.get("id")
    amount = payment_link.get("amount", 0) / 100
    
    # Find the decision associated with this payment link
    # For demo: use the most recent decision
    db = SessionLocal()
    try:
        decision = db.query(Decision).order_by(Decision.id.desc()).first()
        if decision:
            success = event == "payment_link.paid"
            log_outcome(decision.id, success, amount if success else 0)
            
            # Update policy stats
            event_record = db.query(Event).filter(Event.id == decision.event_id).first()
            if event_record:
                update_segment_stats(db, event_record.decline_category, decision.action, success)
    finally:
        db.close()