from pydantic import BaseModel, EmailStr
from typing import Optional

class ClientBase(BaseModel):
    name: str
    email: EmailStr

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: str

    class Config:
        from_attributes = True 