from pydantic import BaseModel
from datetime import datetime
from typing import Optional   # <-- add this line

class EventBase(BaseModel):
    order_id: str
    amount: float
    decline_code: str
    decline_category: Optional[str] = None
    customer_segment: Optional[str] = None
    ground_truth_recoverable: Optional[int] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    timestamp: datetime
    synthetic: int

    class Config:
        from_attributes = True