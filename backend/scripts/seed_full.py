import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import random
import pandas as pd
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.event import Event
from app.models.decision import Decision
from app.models.outcome import Outcome
from app.models.segment_stats import SegmentStat
from app.models.merchant import Merchant
from app.models.user import User
from app.models.alert import Alert
from app.ai.classifier import classify_decline
from app.ai.policy import bandit_choose_action, update_segment_stats, get_segment_stats

CATEGORY_MAP = {
    'INSUFFICIENT_FUNDS': 'insufficient_funds',
    'ISSUER_TIMEOUT': 'issuer_timeout',
    'EXPIRED_CARD': 'expired_instrument',
    'RISK_BLOCK': 'risk_block',
    'OTHER': 'other'
}

def clear_data(session: Session):
    session.query(Alert).delete()
    session.query(Outcome).delete()
    session.query(Decision).delete()
    session.query(Event).delete()
    session.query(SegmentStat).delete()
    session.commit()

def seed_database(session: Session, csv_path: str):
    # Get first user (assumes at least one user exists)
    user = session.query(User).first()
    if not user:
        print("No user found. Creating a default user.")
        from app.core.security import get_password_hash
        user = User(
            username="admin",
            email="admin@recoveriq.com",
            hashed_password=get_password_hash("admin123")
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    # Create default merchant for this user
    merchant = session.query(Merchant).filter_by(user_id=user.id).first()
    if not merchant:
        merchant = Merchant(user_id=user.id, name="Default Merchant")
        session.add(merchant)
        session.commit()
        session.refresh(merchant)

    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} synthetic events.")

    event_count = 0
    for _, row in df.iterrows():
        mapped_category = CATEGORY_MAP.get(row['decline_category'], 'other')
        event = Event(
            order_id=row['order_id'],
            amount=row['amount'],
            decline_code=row['decline_code'],
            decline_category=mapped_category,
            ground_truth_recoverable=row['ground_truth_recoverable'],
            merchant_id=merchant.id,
            user_id=user.id,
            synthetic=1
        )
        session.add(event)
        event_count += 1
        if event_count % 100 == 0:
            session.commit()
    session.commit()
    print(f"Inserted {event_count} events.")

    events = session.query(Event).all()
    decision_count = 0
    outcome_count = 0
    for event in events:
        category = event.decline_category or 'other'
        stats = get_segment_stats(session, category)
        action = bandit_choose_action(stats, epsilon=0.3) if stats else "retry_now"
        if event.ground_truth_recoverable == 1:
            success_prob = 0.7 if action in ["retry_now", "retry_later"] else 0.3
        else:
            success_prob = 0.1
        success = random.random() < success_prob
        decision = Decision(
            event_id=event.id,
            action=action,
            justification=f"AI decision: {action} chosen based on category '{category}'",
            confidence=round(random.uniform(0.6, 0.9), 2),
            llm_used=1 if random.random() > 0.3 else 0
        )
        session.add(decision)
        decision_count += 1
        session.flush()
        outcome = Outcome(
            decision_id=decision.id,
            recovered=1 if success else 0,
            revenue_recovered=event.amount if success else 0.0,
            time_to_recovery=random.uniform(0.5, 4.0) if success else None
        )
        session.add(outcome)
        outcome_count += 1
        update_segment_stats(session, category, action, success)
        if decision_count % 50 == 0:
            session.commit()
    session.commit()
    print(f"✅ Created {decision_count} decisions and {outcome_count} outcomes.")
    print("Seeding complete!")

if __name__ == "__main__":
    db = SessionLocal()
    clear_data(db)
    csv_path = r"C:\MyFolders\IIITNR\Projects\Razorpay\recoveriq\data\synthetic_events.csv"
    seed_database(db, csv_path)
    db.close()