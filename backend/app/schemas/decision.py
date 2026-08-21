from pydantic import BaseModel
from datetime import datetime
from typing import Optional   # <-- add this line

class DecisionResponse(BaseModel):
    id: int
    event_id: int
    action: str
    justification: Optional[str] = None   # optional now works
    confidence: Optional[float] = None
    policy_version: int
    llm_used: int
    timestamp: datetime

    class Config:
        from_attributes = True   # Pydantic v2 uses 'from_attributes' instead of 'orm_mode'