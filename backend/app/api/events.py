from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import SessionLocal
from ..models.event import Event
from ..models.merchant import Merchant
from ..schemas.event import EventResponse, EventCreate
from .auth import get_current_user
from ..models.user import User
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[EventResponse])
def get_events(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Filter by user_id (all events belonging to this user's merchants)
    merchant_ids = [m.id for m in db.query(Merchant).filter_by(user_id=current_user.id).all()]
    if not merchant_ids:
        return []
    events = db.query(Event).filter(Event.merchant_id.in_(merchant_ids)).offset(skip).limit(limit).all()
    return events

@router.post("/", response_model=EventResponse)
def create_event(
    event: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get first merchant of the user (or use a default)
    merchant = db.query(Merchant).filter_by(user_id=current_user.id).first()
    if not merchant:
        raise HTTPException(400, "No merchant found. Please create a merchant first.")
    db_event = Event(
        **event.dict(),
        merchant_id=merchant.id,
        user_id=current_user.id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/export")
def export_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    merchant_ids = [m.id for m in db.query(Merchant).filter_by(user_id=current_user.id).all()]
    events = db.query(Event).filter(Event.merchant_id.in_(merchant_ids)).order_by(Event.id).all()
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["id", "order_id", "amount", "decline_code", "decline_category", "ground_truth_recoverable", "timestamp"])
    writer.writeheader()
    for e in events:
        writer.writerow({
            "id": e.id,
            "order_id": e.order_id,
            "amount": e.amount,
            "decline_code": e.decline_code,
            "decline_category": e.decline_category,
            "ground_truth_recoverable": e.ground_truth_recoverable,
            "timestamp": e.timestamp.isoformat()
        })
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=events.csv"})