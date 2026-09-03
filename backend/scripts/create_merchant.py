import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.merchant import Merchant

db = SessionLocal()
user = db.query(User).first()  # assumes you have at least one user
if user:
    existing = db.query(Merchant).filter_by(user_id=user.id).first()
    if not existing:
        merchant = Merchant(
            user_id=user.id,
            name="My Test Merchant",
            razorpay_key_id="",
            razorpay_key_secret=""
        )
        db.add(merchant)
        db.commit()
        print(f"✅ Merchant created for user {user.username}")
    else:
        print("Merchant already exists")
else:
    print("No user found. Please sign up first.")
db.close()