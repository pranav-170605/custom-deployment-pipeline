from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.ingestion import IngestionJob, IngestionJobCreate, IngestionConfig
from app.db_functions.postgre import metadata_ingestion
from app.crud import ingestion_crud

router = APIRouter()

@router.post("/create-ingestion-job/{connection_id}", response_model=IngestionJob, status_code=201)
async def create_ingestion_job(ingestion: IngestionJobCreate, connection_id: str):
    try:
        return await ingestion_crud.create_ingestion_job(ingestion, connection_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/ingestion-job/{ingestion_id}", response_model=IngestionJob)
async def get_ingestion_job(ingestion_id: str):
    try:
        return await ingestion_crud.get_ingestion_job(ingestion_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.post("/create-ingestion-config/{ingestion_id}")
async def create_ingestion_config(config: IngestionConfig, ingestion_id: str):
    try:
        return await ingestion_crud.create_ingestion_config(config, ingestion_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/ingestion-config/{ingestion_id}")
async def get_ingestion_config(ingestion_id: str):
    try:
        return await ingestion_crud.get_ingestion_config(ingestion_id)
    except Exception as e:    
        raise HTTPException(status_code=400, detail=str(e))  
    
@router.post("/run-ingestion-job/{ingestion_id}")
async def run_ingestion_job(ingestion_id: str):
    try:
        return await metadata_ingestion.fetch_postgres_metadata(ingestion_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))