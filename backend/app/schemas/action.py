from enum import Enum

class RecoveryAction(str, Enum):
    RETRY_NOW = "retry_now"
    RETRY_LATER = "retry_later"
    SWITCH_METHOD = "switch_method"
    ESCALATE = "escalate"
    ABANDON = "abandon"