from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict
from ..core.database import SessionLocal
from ..models.event import Event
from ..models.outcome import Outcome
from ..models.decision import Decision
from ..models.merchant import Merchant
from .auth import get_current_user
from ..models.user import User
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_analytics(
    start_date: str = Query(None, description="YYYY-MM-DD"),
    end_date: str = Query(None, description="YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    merchant_ids = [m.id for m in db.query(Merchant).filter_by(user_id=current_user.id).all()]
    if not merchant_ids:
        return []
    if not start_date or not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    events = db.query(Event).filter(
        Event.merchant_id.in_(merchant_ids),
        Event.timestamp >= start,
        Event.timestamp <= end + timedelta(days=1)
    ).all()

    if not events:
        return []

    decision_map = {}
    for d in db.query(Decision).all():
        decision_map[d.event_id] = d
    outcomes = db.query(Outcome).all()
    outcome_by_decision = {o.decision_id: o for o in outcomes}

    daily = defaultdict(lambda: {"total_events": 0, "recovered_count": 0, "revenue_recovered": 0.0})
    for event in events:
        date_key = event.timestamp.date()
        daily[date_key]["total_events"] += 1
        decision = decision_map.get(event.id)
        if decision:
            outcome = outcome_by_decision.get(decision.id)
            if outcome and outcome.recovered:
                daily[date_key]["recovered_count"] += 1
                daily[date_key]["revenue_recovered"] += outcome.revenue_recovered or 0.0

    result = []
    for date, stats in sorted(daily.items()):
        avg_rate = (stats["recovered_count"] / stats["total_events"] * 100) if stats["total_events"] > 0 else 0
        result.append({
            "date": date.isoformat(),
            "total_events": stats["total_events"],
            "recovered_count": stats["recovered_count"],
            "revenue_recovered": round(stats["revenue_recovered"], 2),
            "avg_recovery_rate": round(avg_rate, 2)
        })
    return result

@router.get("/export")
def export_analytics(
    start_date: str = Query(None),
    end_date: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = get_analytics(start_date, end_date, current_user, db)
    if not data:
        raise HTTPException(404, "No data to export")
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["date", "total_events", "recovered_count", "revenue_recovered", "avg_recovery_rate"])
    writer.writeheader()
    writer.writerows(data)
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=analytics.csv"})