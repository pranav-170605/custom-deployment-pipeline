from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class ClientInDB(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Config:
        from_attributes = True 