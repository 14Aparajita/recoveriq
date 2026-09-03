import razorpay
import time
import random
from ..core.config import get_settings

settings = get_settings()
client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))

def create_payment_link(order_id: str, amount: float, currency: str = "INR") -> dict:
    """
    Create a Razorpay Test Mode Payment Link for recovery.
    Returns dict with payment_link_id, short_url, and other details.
    """
    # Append timestamp + random to make reference_id unique per retry
    unique_ref = f"{order_id}_{int(time.time())}_{random.randint(1000, 9999)}"
    
    data = {
        "amount": int(amount * 100),  # in paise
        "currency": currency,
        "description": f"Recovery payment for order {order_id}",
        "reference_id": unique_ref,   # now unique for every retry
        "customer": {
            "name": "Test Customer",
            "email": "customer@example.com",
            "contact": "9876543210"
        },
        "notify": {
            "sms": True,
            "email": False
        },
        "reminder_enable": True,
        "notes": {
            "policy": "recovery_agent",
            "original_order": order_id   # keep original for reference
        },
        "callback_url": "https://yourdomain.com/api/payment-callback",
        "callback_method": "get"
    }
    payment_link = client.payment_link.create(data)
    return payment_link

def verify_payment_signature(payload: dict, signature: str) -> bool:
    """Verify webhook/payment signature using Razorpay SDK."""
    try:
        client.utility.verify_webhook_signature(payload, signature, settings.razorpay_webhook_secret)
        return True
    except razorpay.errors.SignatureVerificationError:
        return False