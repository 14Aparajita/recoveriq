import re
from enum import Enum
from ..models.event import DeclineCategory

# Mapping from decline codes (patterns) to categories
DECLINE_MAP = [
    (re.compile(r'insufficient.*funds|NSF|not enough', re.I), DeclineCategory.INSUFFICIENT_FUNDS),
    (re.compile(r'timeout|timed out|response timeout|issuer timeout', re.I), DeclineCategory.ISSUER_TIMEOUT),
    (re.compile(r'expired|expiration|card expired', re.I), DeclineCategory.EXPIRED_INSTRUMENT),
    (re.compile(r'risk|fraud|blocked|security|velocity', re.I), DeclineCategory.RISK_BLOCK),
    (re.compile(r'.*'), DeclineCategory.OTHER),  # catch-all
]

def classify_decline(decline_code: str) -> DeclineCategory:
    """Map a raw decline code to a category using regex rules."""
    for pattern, category in DECLINE_MAP:
        if pattern.search(decline_code):
            return category
    return DeclineCategory.OTHER  # fallback