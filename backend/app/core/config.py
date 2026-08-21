from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "RecoverIQ"
    environment: str = "development"
    secret_key: str
    debug: bool = True
    
    database_url: str
    
    razorpay_key_id: str
    razorpay_key_secret: str
    razorpay_webhook_secret: str
    
    openai_api_key: str
    llm_model: str = "gpt-4o-mini"
    
    allowed_origins: list[str] = ["http://localhost:5173"]
    
    rate_limit_requests: int = 100
    rate_limit_period: int = 60

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

@lru_cache
def get_settings():
    return Settings()