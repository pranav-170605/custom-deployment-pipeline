# from datetime import datetime
# from typing import Optional
# from pydantic import BaseModel, Field
# from bson import ObjectId


# class WorkspaceBase(BaseModel):
#     workspace_name: str = Field(..., example="My Workspace")
#     description: Optional[str] = Field(None, example="A workspace for my projects")


# class WorkspaceCreate(WorkspaceBase):
#     pass


# class WorkspaceUpdate(BaseModel):
#     workspace_name: Optional[str] = None
#     description: Optional[str] = None


# class WorkspaceInDB(WorkspaceBase):
#     id: str = Field(..., alias="_id")
#     user_id: str
#     created_at: datetime
#     updated_at: datetime
#     workspace_id: str

#     class Config:
#         from_attributes = True  # for pydantic v2
#         populate_by_name = True
#         json_encoders = {ObjectId: str}

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ProjectBase(BaseModel):
    name: str = Field(..., example="Project Name")
    description: Optional[str] = Field(None, example="Project description")


class ProjectCreate(ProjectBase):
    pass


class ProjectInDB(ProjectBase):
    project_id: str
    workspace_id: str
    created_at: datetime
    updated_at: datetime


class WorkspaceBase(BaseModel):
    name: str = Field(..., example="Workspace Name")
    description: Optional[str] = Field(None, example="Workspace description")


class WorkspaceWithProjectCreate(WorkspaceBase):
    project: ProjectCreate


class WorkspaceInDB(WorkspaceBase):
    workspace_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    projects: Optional[List[ProjectInDB]] = []
