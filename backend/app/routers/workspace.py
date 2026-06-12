# from typing import List
# from fastapi import APIRouter, HTTPException
# from app.crud import workspace as workspace_crud
# from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceInDB

# router = APIRouter()

# @router.post("/", response_model=WorkspaceInDB)
# async def create_workspace(workspace: WorkspaceCreate, user_id: str):
#     try:
#         workspace_dict = workspace.dict()
#         created = await workspace_crud.create_workspace(workspace_dict, user_id)
#         return created
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# @router.get("/user/{user_id}", response_model=List[WorkspaceInDB])
# async def get_user_workspaces(user_id: str):
#     try:
#         return await workspace_crud.get_user_workspaces(user_id)
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))


# @router.get("/{workspace_id}", response_model=List[WorkspaceInDB])
# async def get_workspace(workspace_id: str):
#     try:
#         workspace = await workspace_crud.get_workspace(workspace_id)
#         if not workspace:
#             raise HTTPException(status_code=404, detail="Workspace not found")
#         return workspace
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# from app.schemas.workspace import WorkspaceUpdate

# @router.put("/{workspace_id}", response_model=WorkspaceInDB)
# async def update_workspace_endpoint(workspace_id: str, workspace_data: WorkspaceUpdate):
#     try:
#         updated_workspace = await workspace_crud.update_workspace(workspace_id, workspace_data.dict(exclude_unset=True))
#         if updated_workspace:
#             return updated_workspace
#         raise HTTPException(status_code=404, detail="Workspace not found or not updated.")
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))


# @router.delete("/{workspace_id}")
# async def delete_workspace(workspace_id: str):
#     try:
#         deleted = await workspace_crud.delete_workspace(workspace_id)
#         if not deleted:
#             raise HTTPException(status_code=404, detail="Workspace not found")
#         return {"message": "Workspace deleted successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.workspace import WorkspaceWithProjectCreate, WorkspaceInDB
from app.crud import workspace as crud
from fastapi.encoders import jsonable_encoder

router = APIRouter()


@router.post("/user/workspace/{user_id}")
async def create_workspace_with_project(user_id: str, body: WorkspaceWithProjectCreate):
    try:
        return await crud.create_workspace_with_project(body.dict(), user_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user/{user_id}", response_model=List[WorkspaceInDB])
async def get_workspaces_by_user(user_id: str):
    try:
        return await crud.get_user_workspaces_with_projects(user_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{workspace_id}")
async def get_workspace(workspace_id: str):
    try:
        workspace = await crud.get_workspace(workspace_id)
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found")
        workspace = jsonable_encoder(workspace)
        return workspace
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{workspace_id}", response_model=WorkspaceInDB)
async def update_workspace(workspace_id: str, data: dict):
    try:
        updated = await crud.update_workspace(workspace_id, data)
        if not updated:
            raise HTTPException(status_code=404, detail="Workspace not found or not updated")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{workspace_id}")
async def delete_workspace(workspace_id: str):
    try:
        success = await crud.delete_workspace(workspace_id)
        if not success:
            raise HTTPException(status_code=404, detail="Workspace not found")
        return {"message": "Workspace and associated projects deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
