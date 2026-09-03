from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.user import User
from ..models.event import Event
from ..models.outcome import Outcome
from ..models.decision import Decision
from ..models.merchant import Merchant
from ..models.alert import Alert
from ..models.segment_stats import SegmentStat
from ..ai.policy import bandit_choose_action, update_segment_stats, get_segment_stats
from .auth import get_current_user
from sqlalchemy import func
import random
import csv
import os

router = APIRouter(prefix="/api/admin", tags=["admin"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def is_admin(user: User):
    return user.is_admin == 1

@router.get("/users")
def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user):
        raise HTTPException(403, "Admin only")
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "is_admin": u.is_admin} for u in users]

@router.get("/stats")
def system_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_admin(current_user):
        raise HTTPException(403, "Admin only")
    total_users = db.query(User).count()
    total_events = db.query(Event).count()
    total_recovered = db.query(Outcome).filter_by(recovered=1).count()
    total_revenue = db.query(func.sum(Outcome.revenue_recovered)).scalar() or 0
    return {"total_users": total_users, "total_events": total_events, "total_recovered": total_recovered, "total_revenue": total_revenue}

@router.get("/segment-stats")
def get_all_segment_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stats = db.query(SegmentStat).all()
    # Group by decline_category
    result = {}
    for stat in stats:
        if stat.decline_category not in result:
            result[stat.decline_category] = []
        result[stat.decline_category].append({
            "action": stat.action,
            "attempts": stat.attempts,
            "successes": stat.successes,
            "success_rate": round(stat.success_rate * 100, 2)
        })
    return result


# ============================================================
# SEED ENDPOINT — populates the DB with realistic demo data
# ============================================================

CATEGORY_MAP = {
    'INSUFFICIENT_FUNDS': 'insufficient_funds',
    'ISSUER_TIMEOUT': 'issuer_timeout',
    'EXPIRED_CARD': 'expired_instrument',
    'RISK_BLOCK': 'risk_block',
    'OTHER': 'other',
}

@router.post("/seed")
def seed_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Seed the database with synthetic events, decisions, outcomes, and
    segment stats for the currently logged-in user.
    Clears any previous synthetic data first to avoid duplicates.
    """
    # ---- 1. Ensure the user has a merchant ----
    merchant = db.query(Merchant).filter_by(user_id=current_user.id).first()
    if not merchant:
        merchant = Merchant(user_id=current_user.id, name="Demo Merchant")
        db.add(merchant)
        db.commit()
        db.refresh(merchant)

    # ---- 2. Clear old synthetic data for this user ----
    old_event_ids = [e.id for e in db.query(Event).filter_by(user_id=current_user.id).all()]
    if old_event_ids:
        old_decision_ids = [d.id for d in db.query(Decision).filter(Decision.event_id.in_(old_event_ids)).all()]
        if old_decision_ids:
            db.query(Outcome).filter(Outcome.decision_id.in_(old_decision_ids)).delete(synchronize_session=False)
            db.query(Alert).filter(Alert.decision_id.in_(old_decision_ids)).delete(synchronize_session=False)
            db.query(Decision).filter(Decision.id.in_(old_decision_ids)).delete(synchronize_session=False)
        db.query(Alert).filter(Alert.event_id.in_(old_event_ids)).delete(synchronize_session=False)
        db.query(Event).filter(Event.id.in_(old_event_ids)).delete(synchronize_session=False)
    db.query(SegmentStat).delete(synchronize_session=False)
    db.commit()

    # ---- 3. Load CSV ----
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "synthetic_events.csv")
    csv_path = os.path.normpath(csv_path)

    if not os.path.exists(csv_path):
        # Fall back to the absolute path used in the original script
        csv_path = r"C:\MyFolders\IIITNR\Projects\Razorpay\recoveriq\data\synthetic_events.csv"

    if not os.path.exists(csv_path):
        raise HTTPException(404, f"Synthetic CSV not found at {csv_path}")

    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # ---- 4. Insert events ----
    event_count = 0
    for row in rows:
        mapped_category = CATEGORY_MAP.get(row['decline_category'], 'other')
        event = Event(
            order_id=row['order_id'],
            amount=float(row['amount']),
            decline_code=row['decline_code'],
            decline_category=mapped_category,
            ground_truth_recoverable=int(row['ground_truth_recoverable']),
            merchant_id=merchant.id,
            user_id=current_user.id,
            synthetic=1,
        )
        db.add(event)
        event_count += 1
        if event_count % 100 == 0:
            db.commit()
    db.commit()

    # ---- 5. Generate decisions + outcomes via bandit policy ----
    events = db.query(Event).filter_by(user_id=current_user.id).all()
    decision_count = 0
    outcome_count = 0
    recovered_count = 0
    total_revenue = 0.0

    for event in events:
        category = event.decline_category or 'other'
        stats = get_segment_stats(db, category)
        action = bandit_choose_action(stats, epsilon=0.3) if stats else "retry_now"

        # Simulate outcome based on ground truth
        if event.ground_truth_recoverable == 1:
            success_prob = 0.7 if action in ["retry_now", "retry_later"] else 0.3
        else:
            success_prob = 0.1
        success = random.random() < success_prob

        decision = Decision(
            event_id=event.id,
            action=action,
            justification=f"AI decision: {action} chosen based on category '{category}'",
            confidence=round(random.uniform(0.6, 0.95), 2),
            llm_used=1 if random.random() > 0.3 else 0,
        )
        db.add(decision)
        db.flush()  # get decision.id
        decision_count += 1

        rev = event.amount if success else 0.0
        outcome = Outcome(
            decision_id=decision.id,
            recovered=1 if success else 0,
            revenue_recovered=rev,
            time_to_recovery=round(random.uniform(0.5, 4.0), 2) if success else None,
        )
        db.add(outcome)
        outcome_count += 1
        if success:
            recovered_count += 1
            total_revenue += rev

        # Update bandit segment stats
        update_segment_stats(db, category, action, success)

        if decision_count % 50 == 0:
            db.commit()
    db.commit()

    # ---- 6. Create a few sample alerts ----
    sample_decisions = db.query(Decision).join(Event).filter(
        Event.user_id == current_user.id
    ).order_by(Decision.id.desc()).limit(5).all()
    for d in sample_decisions:
        alert = Alert(
            user_id=current_user.id,
            event_id=d.event_id,
            decision_id=d.id,
            type="recovery_attempt",
            message=f"AI chose '{d.action}' for event #{d.event_id} (confidence: {d.confidence})",
        )
        db.add(alert)
    db.commit()

    return {
        "status": "success",
        "events_created": event_count,
        "decisions_created": decision_count,
        "outcomes_created": outcome_count,
        "recovered_count": recovered_count,
        "total_revenue_recovered": round(total_revenue, 2),
        "message": f"Database seeded with {event_count} events. Refresh your dashboard!",
    }