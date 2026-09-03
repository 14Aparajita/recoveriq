from app.ai.classifier import classify_decline
from app.models.event import DeclineCategory

def test_classify_insufficient_funds():
    assert classify_decline("Insufficient Funds") == DeclineCategory.INSUFFICIENT_FUNDS
    assert classify_decline("NSF") == DeclineCategory.INSUFFICIENT_FUNDS

def test_classify_timeout():
    assert classify_decline("timeout") == DeclineCategory.ISSUER_TIMEOUT

def test_classify_other():
    assert classify_decline("unknown_code") == DeclineCategory.OTHER