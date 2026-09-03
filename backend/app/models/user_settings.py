from sqlalchemy import Column, Integer, ForeignKey, String, Boolean, Text
from sqlalchemy.orm import relationship
from ..core.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    theme = Column(String(20), default="light")
    default_dashboard = Column(String(50), default="dashboard")
    email_notifications = Column(Boolean, default=True)
    alert_threshold = Column(Integer, default=0)
    additional_preferences = Column(Text, nullable=True)
    user = relationship("User", back_populates="settings")