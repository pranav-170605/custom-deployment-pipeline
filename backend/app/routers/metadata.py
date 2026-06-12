from fastapi import APIRouter, HTTPException
from typing import List
from app.crud import metadata as metadata_crud

router = APIRouter()


@router.get("/{ingestion_id}/all")
async def get_all_metadata(ingestion_id: str):
    metadata = await metadata_crud.get_metadata_by_ingestion_id(ingestion_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="No metadata found for this ingestion ID")
    return metadata

@router.get("/{ingestion_id}/databases")
async def get_databases(ingestion_id: str):
    databases = await metadata_crud.get_all_databases(ingestion_id)
    if not databases:
        raise HTTPException(status_code=404, detail="No metadata found for this ingestion ID")
    return {"databases": databases}

@router.get("/{ingestion_id}/databases/{database_name}/schemas")
async def get_schemas(ingestion_id: str, database_name: str):
    schemas = await metadata_crud.get_schemas_by_database(ingestion_id, database_name)
    if not schemas:
        raise HTTPException(status_code=404, detail="No schemas found for this database")
    return {"schemas": schemas}

@router.get("/{ingestion_id}/databases/{database_name}/schemas/{schema_name}/tables")
async def get_tables(ingestion_id: str, database_name: str, schema_name: str):
    tables = await metadata_crud.get_tables_by_schema(ingestion_id, database_name, schema_name)
    if not tables:
        raise HTTPException(status_code=404, detail="No tables found for this schema")
    return {"tables": tables}

@router.get("/{ingestion_id}/databases/{database_name}/schemas/{schema_name}/tables/{table_name}")
async def get_table_details(ingestion_id: str, database_name: str, schema_name: str, table_name: str):
    table_details = await metadata_crud.get_table_details(ingestion_id, database_name, schema_name, table_name)
    if not table_details:
        raise HTTPException(status_code=404, detail="Table not found")
    return table_details 

@router.get("/{ingestion_id}/all")
async def get_all_metadata(ingestion_id: str):
    metadata = await metadata_crud.get_metadata_by_ingestion_id(ingestion_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="No metadata found for this ingestion ID")
    return metadata