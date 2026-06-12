from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.source_connection import (
    SourceConnectionCreate, SourceConnectionUpdate, SourceConnectionInDB
)
from app.crud import source_connection as conn_crud

router = APIRouter(prefix="/source-connections", tags=["Source Connections"])

@router.post("/{project_id}", response_model=SourceConnectionInDB)
async def create_connection(project_id: str, conn_data: SourceConnectionCreate):
    try:
        return await conn_crud.create_source_connection(project_id, conn_data.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/project/{project_id}", response_model=List[SourceConnectionInDB])
async def get_connections_by_project(project_id: str):
    try:
        return await conn_crud.get_connections_by_project(project_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{src_conn_id}", response_model=SourceConnectionInDB)
async def get_connection(src_conn_id: str):
    conn = await conn_crud.get_connection_by_id(src_conn_id)
    if conn:
        return conn
    raise HTTPException(status_code=404, detail="Connection not found")

@router.put("/{src_conn_id}", response_model=SourceConnectionInDB)
async def update_connection(src_conn_id: str, update_data: SourceConnectionUpdate):
    updated = await conn_crud.update_source_connection(src_conn_id, update_data.dict(exclude_unset=True))
    if updated:
        return updated
    raise HTTPException(status_code=404, detail="Update failed or connection not found")

@router.delete("/{src_conn_id}", response_model=bool)
async def delete_connection(src_conn_id: str):
    return await conn_crud.delete_source_connection(src_conn_id)
