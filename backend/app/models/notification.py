from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str # 'warning' | 'success'
    is_read: bool = False

class NotificationCreate(NotificationBase):
    user_id: str

class NotificationResponse(NotificationBase):
    id: str = Field(alias="_id")
    user_id: str
    created_at: datetime
    
    model_config = ConfigDict(populate_by_name=True)
