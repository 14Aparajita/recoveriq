from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, JSON
from sqlalchemy.sql import func
from ..core.database import Base
import enum

class DeclineCategory(str, enum.Enum):
    INSUFFICIENT_FUNDS = "insufficient_funds"
    ISSUER_TIMEOUT = "issuer_timeout"
    EXPIRED_INSTRUMENT = "expired_instrument"
    RISK_BLOCK = "risk_block"
    OTHER = "other"

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(64), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    decline_code = Column(String(32), nullable=False)
    decline_category = Column(Enum(DeclineCategory), nullable=True)
    customer_segment = Column(String(32), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    synthetic = Column(Integer, default=1)  # 1 for generated, 0 for real (test)
    ground_truth_recoverable = Column(Integer, nullable=True)  # 1=yes, 0=no