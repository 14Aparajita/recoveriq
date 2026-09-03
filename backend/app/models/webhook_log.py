from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.sql import func
from ..core.database import Base

class WebhookLog(Base):
    __tablename__ = "webhook_logs"
    id = Column(Integer, primary_key=True)
    event_type = Column(String(50))
    payload = Column(JSON)
    signature = Column(String(255), nullable=True)
    processed = Column(Integer, default=0)  # 0 = pending, 1 = success, 2 = failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())