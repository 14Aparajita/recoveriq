from sqlalchemy import Column, Integer, Date, Float, ForeignKey
from ..core.database import Base

class AnalyticsDaily(Base):
    __tablename__ = "analytics_daily"
    id = Column(Integer, primary_key=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"))
    date = Column(Date, nullable=False)
    total_events = Column(Integer, default=0)
    recovered_count = Column(Integer, default=0)
    revenue_recovered = Column(Float, default=0.0)
    total_revenue_lost = Column(Float, default=0.0)
    avg_recovery_rate = Column(Float, default=0.0)