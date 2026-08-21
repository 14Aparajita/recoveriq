from sqlalchemy.orm import Session
from ..models.segment_stats import SegmentStat
import random

def get_segment_stats(session: Session, decline_category: str):
    stats = session.query(SegmentStat).filter_by(decline_category=decline_category).all()
    return {stat.action: stat.success_rate for stat in stats}

def update_segment_stats(session: Session, decline_category: str, action: str, success: bool):
    stat = session.query(SegmentStat).filter_by(
        decline_category=decline_category,
        action=action
    ).first()
    if not stat:
        stat = SegmentStat(
            decline_category=decline_category,
            action=action,
            attempts=0,
            successes=0,
            success_rate=0.0
        )
        session.add(stat)
    stat.attempts += 1
    if success:
        stat.successes += 1
    stat.success_rate = stat.successes / stat.attempts if stat.attempts > 0 else 0.0
    session.commit()

def bandit_choose_action(stats, epsilon=0.2):
    if not stats:
        return "retry_now"
    if random.random() < epsilon:
        return random.choice(list(stats.keys()))
    return max(stats, key=lambda a: stats.get(a, 0.0))