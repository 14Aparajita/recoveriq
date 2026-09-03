from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.user import User
from ..models.user_settings import UserSettings
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/users", tags=["users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SettingsUpdate(BaseModel):
    theme: str = "light"
    default_dashboard: str = "dashboard"
    email_notifications: bool = True
    alert_threshold: int = 0

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username, "email": current_user.email}

@router.get("/me/settings")
def get_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter_by(user_id=current_user.id).first()
    if not settings:
        # Create default settings
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return {
        "theme": settings.theme,
        "default_dashboard": settings.default_dashboard,
        "email_notifications": settings.email_notifications,
        "alert_threshold": settings.alert_threshold,
        "additional_preferences": settings.additional_preferences
    }

@router.put("/me/settings")
def update_settings(update: SettingsUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter_by(user_id=current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    settings.theme = update.theme
    settings.default_dashboard = update.default_dashboard
    settings.email_notifications = update.email_notifications
    settings.alert_threshold = update.alert_threshold
    db.commit()
    return {"msg": "Settings updated"}



class ProfileUpdate(BaseModel):
    username: str
    email: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

@router.put("/me")
def update_profile(update: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == update.username, User.id != current_user.id).first():
        raise HTTPException(400, "Username already taken")
    current_user.username = update.username
    current_user.email = update.email
    db.commit()
    return {"msg": "Profile updated"}

@router.post("/change-password")
def change_password(data: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(400, "Current password incorrect")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"msg": "Password changed"}