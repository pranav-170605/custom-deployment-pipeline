from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProjectBase(BaseModel):
    name: str = Field(..., example="Data Analytics Project")
    description: Optional[str] = Field(None, example="This project handles EDA workflows.")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectInDB(ProjectBase):
    project_id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # for pydantic v2+
