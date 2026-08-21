import csv
import random
import uuid
from datetime import datetime, timedelta

DECLINE_CODES = [
    ("INSUFFICIENT_FUNDS", 0.35),
    ("ISSUER_TIMEOUT", 0.20),
    ("EXPIRED_CARD", 0.15),
    ("RISK_BLOCK", 0.10),
    ("OTHER", 0.20),
]

# Ground truth: recoverable probabilities per category
RECOVERABLE_PROB = {
    "INSUFFICIENT_FUNDS": 0.7,
    "ISSUER_TIMEOUT": 0.8,
    "EXPIRED_CARD": 0.1,
    "RISK_BLOCK": 0.2,
    "OTHER": 0.3,
}

def generate_events(n=1000):
    events = []
    for i in range(n):
        decline_code, _ = random.choices(DECLINE_CODES, weights=[p for _, p in DECLINE_CODES])[0]
        category = decline_code
        amount = round(random.uniform(100, 50000), 2)
        order_id = f"ord_{uuid.uuid4().hex[:8]}"
        recoverable = 1 if random.random() < RECOVERABLE_PROB[category] else 0
        timestamp = datetime.now() - timedelta(days=random.randint(0, 30))
        events.append({
            "order_id": order_id,
            "amount": amount,
            "decline_code": decline_code,
            "decline_category": category,
            "ground_truth_recoverable": recoverable,
            "timestamp": timestamp.isoformat(),
        })
    return events

if __name__ == "__main__":
    events = generate_events(1000)
    with open("synthetic_events.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=events[0].keys())
        writer.writeheader()
        writer.writerows(events)
    print("Generated 1000 synthetic events.")