import razorpay
from ..core.config import get_settings

settings = get_settings()
client = razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))

def create_payment_link(order_id: str, amount: float, currency: str = "INR") -> dict:
    """
    Create a Razorpay Test Mode Payment Link for recovery.
    Returns dict with payment_link_id, short_url, and other details.
    """
    data = {
        "amount": int(amount * 100),  # in paise
        "currency": currency,
        "description": f"Recovery payment for order {order_id}",
        "reference_id": order_id,   # your order ID
        "customer": {
            "name": "Test Customer",
            "email": "test@example.com",
            "contact": "9999999999"
        },
        "notify": {
            "sms": True,
            "email": False
        },
        "reminder_enable": True,
        "notes": {
            "policy": "recovery_agent"
        },
        "callback_url": "https://yourdomain.com/api/payment-callback",  # optional
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