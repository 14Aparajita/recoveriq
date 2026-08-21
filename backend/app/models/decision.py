from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base

class Decision(Base):
    __tablename__ = "decisions"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    action = Column(String(32), nullable=False)   # retry_now, retry_later, switch_method, escalate, abandon
    justification = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    policy_version = Column(Integer, default=1)
    llm_used = Column(Integer, default=1)         # 1 if LLM, 0 if fallback
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    event = relationship("Event", backref="decisions")