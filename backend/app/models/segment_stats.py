from sqlalchemy import Column, Integer, String, Float, DateTime, PrimaryKeyConstraint
from sqlalchemy.sql import func
from ..core.database import Base

class SegmentStat(Base):
    __tablename__ = "segment_stats"
    decline_category = Column(String(32), primary_key=True)
    action = Column(String(32), primary_key=True)
    attempts = Column(Integer, default=0)
    successes = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    __table_args__ = (PrimaryKeyConstraint('decline_category', 'action'),)