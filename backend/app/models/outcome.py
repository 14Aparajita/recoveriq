from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.sql import func
from ..core.database import Base

class Outcome(Base):
    __tablename__ = "outcomes"
    id = Column(Integer, primary_key=True, index=True)
    decision_id = Column(Integer, ForeignKey("decisions.id"))
    recovered = Column(Integer, default=0)        # 1=success, 0=fail
    revenue_recovered = Column(Float, default=0.0)
    time_to_recovery = Column(Float, nullable=True) # hours
    razorpay_payment_id = Column(String(64), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())