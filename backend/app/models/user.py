from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class UserInDB(BaseModel):
    user_id: str
    username: str
    email: str
    hashed_password: str
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True