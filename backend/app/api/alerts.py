from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.alert import Alert
from .auth import get_current_user
from ..models.user import User
import json
from ..websocket import manager

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_alerts(limit: int = 20, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter_by(user_id=current_user.id).order_by(Alert.created_at.desc()).limit(limit).all()
    return [{"id": a.id, "type": a.type, "message": a.message, "read": a.read, "created_at": a.created_at.isoformat()} for a in alerts]

@router.put("/{alert_id}/read")
def mark_read(alert_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = db.query(Alert).filter_by(id=alert_id, user_id=current_user.id).first()
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.read = True
    db.commit()
    return {"msg": "Marked as read"}

@router.post("/test")
async def create_test_alert(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    alert = Alert(
        user_id=current_user.id,
        type="test",
        message="This is a test notification from RecoverIQ.",
        read=False
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    # Broadcast via WebSocket
    await manager.broadcast(json.dumps({"type": "new_alert", "data": {"id": alert.id, "message": alert.message}}))
    return {"msg": "Alert created", "id": alert.id}