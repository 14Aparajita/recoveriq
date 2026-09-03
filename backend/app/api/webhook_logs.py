from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.webhook_log import WebhookLog
from .auth import get_current_user
from ..models.user import User

router = APIRouter(prefix="/api/webhook-logs", tags=["webhook logs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_logs(limit: int = 50, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(WebhookLog).order_by(WebhookLog.created_at.desc()).limit(limit).all()
    return [{"id": l.id, "event_type": l.event_type, "processed": l.processed, "error_message": l.error_message, "created_at": l.created_at.isoformat(), "payload": l.payload} for l in logs]