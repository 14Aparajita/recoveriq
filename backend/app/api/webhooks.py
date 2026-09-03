from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from ..core.database import SessionLocal
from ..services.razorpay_service import verify_payment_signature
from ..services.audit_service import log_outcome, get_decision_by_payment_link
from ..ai.policy import update_segment_stats
from ..models.decision import Decision
from ..models.event import Event
import json
from ..models.webhook_log import WebhookLog

router = APIRouter(prefix="/webhooks/razorpay", tags=["webhooks"])

@router.post("/")
async def razorpay_webhook(request: Request, background_tasks: BackgroundTasks):
    body = await request.body()
    payload = json.loads(body)
    signature = request.headers.get("X-Razorpay-Signature")
    
    # Log incoming webhook
    log = WebhookLog(
        event_type=payload.get("event", "unknown"),
        payload=payload,
        signature=signature,
        processed=0
    )
    db = SessionLocal()
    db.add(log)
    db.commit()
    db.refresh(log)
    log_id = log.id
    db.close()
    
    # Process in background
    background_tasks.add_task(process_webhook_event, payload, log_id)
    return {"status": "accepted"}

def process_webhook_event(payload: dict, log_id: int):
    db = SessionLocal()
    try:
        event = payload.get("event")
        if event in ["payment_link.paid", "payment_link.failed"]:
            payment_link = payload.get("payload", {}).get("payment_link", {}).get("entity", {})
            amount = payment_link.get("amount", 0) / 100
            order_id = payment_link.get("reference_id")
            
            # Find the decision associated with this payment link.
            event_record = db.query(Event).filter(Event.order_id == order_id).order_by(Event.id.desc()).first()
            if event_record:
                decision = db.query(Decision).filter(Decision.event_id == event_record.id).order_by(Decision.id.desc()).first()
                if decision:
                    success = (event == "payment_link.paid")
                    log_outcome(decision.id, success, amount if success else 0)
                    
                    # Update policy statistics
                    if event_record.decline_category:
                        update_segment_stats(db, event_record.decline_category, decision.action, success)
        
        # Mark log as success
        log = db.query(WebhookLog).filter_by(id=log_id).first()
        if log:
            log.processed = 1
            db.commit()
    except Exception as e:
        log = db.query(WebhookLog).filter_by(id=log_id).first()
        if log:
            log.processed = 2
            log.error_message = str(e)
            db.commit()
    finally:
        db.close()