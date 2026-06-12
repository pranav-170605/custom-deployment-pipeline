from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.schemas.project import ProjectUpdate, ProjectInDB
from app.crud import project as project_crud

router = APIRouter(prefix="/projects", tags=["Projects"])


# @router.post("/", response_model=ProjectInDB)
# async def create_project(workspace_id: str = Query(...), project_data: ProjectCreate = ...):
#     try:
#         return await project_crud.create_project(workspace_id, project_data.dict())
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}", response_model=List[ProjectInDB])
async def get_projects_by_workspace(workspace_id: str):
    try:
        return await project_crud.get_projects_by_workspace(workspace_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{project_id}", response_model=ProjectInDB)
async def get_project_by_id(project_id: str):
    project = await project_crud.get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.put("/{project_id}", response_model=ProjectInDB)
async def update_project(project_id: str, update_data: ProjectUpdate):
    updated_project = await project_crud.update_project(project_id, update_data.dict(exclude_unset=True))
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found or not updated")
    return updated_project


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    success = await project_crud.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found or not deleted")
    return {"message": "Project deleted successfully"}
