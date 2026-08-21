import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import random
import pandas as pd
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.event import Event, DeclineCategory
from app.models.segment_stats import SegmentStat
from app.ai.classifier import classify_decline
# from app.ai.agent import decide_action   # not used, can comment out
from app.ai.policy import bandit_choose_action, update_segment_stats, get_segment_stats


def evaluate(session: Session, events_df: pd.DataFrame):
    # Split into train and hold-out (80/20)
    events_df = events_df.sample(frac=1, random_state=42).reset_index(drop=True)
    split = int(0.8 * len(events_df))
    train_df = events_df.iloc[:split]
    holdout_df = events_df.iloc[split:]
    
    # Simulate baseline: always retry once after 1 hour
    baseline_recovered = 0
    baseline_revenue = 0
    for _, row in holdout_df.iterrows():
        if row['ground_truth_recoverable'] == 1:
            # Assume 50% chance success with blind retry (simple)
            if random.random() < 0.5:
                baseline_recovered += 1
                baseline_revenue += row['amount']
    
    # Train policy on train set
    for _, row in train_df.iterrows():
        category = classify_decline(row['decline_code']).value
        # Simulate outcome for training actions (simplified: use ground truth)
        action = random.choice(["retry_now", "retry_later", "switch_method"])
        success = 1 if row['ground_truth_recoverable'] == 1 and random.random() < 0.6 else 0
        update_segment_stats(session, category, action, success)
    
    # Evaluate RecoverIQ policy on holdout
    recoveriq_recovered = 0
    recoveriq_revenue = 0
    for _, row in holdout_df.iterrows():
        category = classify_decline(row['decline_code']).value
        stats = get_segment_stats(session, category)
        action = bandit_choose_action(stats)  # or use LLM agent, but we use bandit for eval
        # Simulate outcome: success if ground truth recoverable and action is appropriate
        # For simplicity, we assume retry_now/retry_later have some probability
        prob = 0.7 if action in ["retry_now", "retry_later"] and row['ground_truth_recoverable']==1 else 0.1
        if random.random() < prob:
            recoveriq_recovered += 1
            recoveriq_revenue += row['amount']
    
    # Compute metrics
    total_holdout = len(holdout_df)
    baseline_rate = baseline_recovered / total_holdout
    recoveriq_rate = recoveriq_recovered / total_holdout
    improvement = recoveriq_rate - baseline_rate
    
    print(f"Total holdout events: {total_holdout}")
    print(f"Baseline recovery rate: {baseline_rate:.2%}")
    print(f"RecoverIQ recovery rate: {recoveriq_rate:.2%}")
    print(f"Improvement: {improvement:.2%}")
    print(f"Baseline revenue recovered: ₹{baseline_revenue:.2f}")
    print(f"RecoverIQ revenue recovered: ₹{recoveriq_revenue:.2f}")

if __name__ == "__main__":
    db = SessionLocal()
    # Load synthetic events from CSV into DB if not already
    events_df = pd.read_csv(r"C:\MyFolders\IIITNR\Projects\Razorpay\recoveriq\data\synthetic_events.csv")
    evaluate(db, events_df)
    db.close()