# from typing import List, Optional
# from datetime import datetime
# from bson import ObjectId
# from app.schemas.ingestion import IngestionJob, IngestionJobCreate, IngestionConfig, IngestionConfigResponse
# from app.db.mongodb import mongodb

# async def create_ingestion_job(ingestion: IngestionJobCreate, connection_id: str) -> IngestionJob:
#     ingestion_dict = ingestion.model_dump()
#     ingestion_dict["_id"] = ObjectId()
#     ingestion_dict["ingestion_id"] = str(ingestion_dict["_id"])
#     ingestion_dict["created_at"] = datetime.utcnow()
#     ingestion_dict["updated_at"] = datetime.utcnow()
#     ingestion_dict["src_conn_id"] = connection_id
#     ingestion_dict["status"] = "pending"
    
#     result = await mongodb.db["ingestion_jobs"].insert_one(ingestion_dict)
#     ingestion_dict["ingestion_id"] = str(result.inserted_id)
#     return IngestionJob(**ingestion_dict)

# async def create_ingestion_config(ingestion_config : IngestionConfig, ingestion_id: str) -> IngestionConfig:
#     ingestion_config_dict = ingestion_config.model_dump()
#     ingestion_config_dict["_id"] = ObjectId()
#     ingestion_config_dict["ingestion_config_id"] = str(ingestion_config_dict["_id"])
#     ingestion_config_dict["created_at"] = datetime.utcnow()
#     ingestion_config_dict["updated_at"] = datetime.utcnow()
#     ingestion_config_dict["ingestion_id"] = ingestion_id
    
#     result = await mongodb.db["ingestion_configs"].insert_one(ingestion_config_dict)
#     ingestion_config_dict["ingestion_id"] = str(result.inserted_id)
#     return IngestionConfig(**ingestion_config_dict)

# async def get_ingestion_job(ingestion_id: str) -> IngestionJob:
#     ingestion = await mongodb.db["ingestion_jobs"].find_one({"ingestion_id": ingestion_id})
#     return IngestionJob(**ingestion)

# async def get_ingestion_config(ingestion_id: str):
#     ingestion = await mongodb.db["ingestion_configs"].find_one({"ingestion_id": ingestion_id})
#     return IngestionConfigResponse(**ingestion)

# #ingestion metadata
# async def save_metadata_in_db(ingestion_id: str, metadata: dict):
#     result = await mongodb.db["metadata"].update_one({"ingestion_id": ingestion_id},{"$set": {"ingestion_id": ingestion_id, "metadata": metadata}}, upsert=True)
#     return str(result) 
from typing import List, Optional
from datetime import datetime
from pytz import timezone
from fastapi import HTTPException
from app.schemas.ingestion import (
    IngestionJob,
    IngestionJobCreate,
    IngestionConfig,
    IngestionConfigResponse,
)
from app.db.mongodb import mongodb

IST = timezone("Asia/Kolkata")


# Helper: generate next ingestion_id like i001, i002, ...
async def get_next_ingestion_id() -> str:
    latest = await mongodb.db["ingestion_jobs"].find_one(
        {"ingestion_id": {"$regex": "^i\\d+$"}},
        sort=[("ingestion_id", -1)]
    )
    number = int(latest["ingestion_id"][1:]) + 1 if latest else 1
    return f"i{str(number).zfill(3)}"


# Helper: generate next ingestion_config_id like ic001, ic002, ...
async def get_next_ingestion_config_id() -> str:
    latest = await mongodb.db["ingestion_configs"].find_one(
        {"ingestion_config_id": {"$regex": "^ic\\d+$"}},
        sort=[("ingestion_config_id", -1)]
    )
    number = int(latest["ingestion_config_id"][2:]) + 1 if latest else 1
    return f"ic{str(number).zfill(3)}"


# ✅ Create ingestion job with src_conn_id validation
async def create_ingestion_job(ingestion: IngestionJobCreate, connection_id: str) -> IngestionJob:
    if not connection_id or not isinstance(connection_id, str):
        raise HTTPException(status_code=400, detail="Missing or invalid connection_id")

    connection_id = connection_id.strip()

    source_connection = await mongodb.db["source_connections"].find_one({"src_conn_id": connection_id})
    if not source_connection:
        raise HTTPException(
            status_code=404,
            detail=f"Source connection with ID '{connection_id}' does not exist."
        )

    now = datetime.now(IST)
    ingestion_dict = ingestion.model_dump()

    ingestion_id = await get_next_ingestion_id()

    ingestion_dict.update({
        "ingestion_id": ingestion_id,
        "src_conn_id": connection_id,
        "created_at": now,
        "updated_at": now,
        "status": "pending"
    })

    await mongodb.db["ingestion_jobs"].insert_one(ingestion_dict)
    return IngestionJob(**ingestion_dict)


# Create ingestion config with ic001-style ID
async def create_ingestion_config(ingestion_config: IngestionConfig, ingestion_id: str) -> IngestionConfig:
    now = datetime.now(IST)
    ingestion_config_dict = ingestion_config.model_dump()

    ingestion_config_id = await get_next_ingestion_config_id()

    ingestion_config_dict.update({
        "ingestion_config_id": ingestion_config_id,
        "ingestion_id": ingestion_id,
        "created_at": now,
        "updated_at": now
    })

    await mongodb.db["ingestion_configs"].insert_one(ingestion_config_dict)
    return IngestionConfig(**ingestion_config_dict)


# Fetch ingestion job
async def get_ingestion_job(ingestion_id: str) -> IngestionJob:
    ingestion = await mongodb.db["ingestion_jobs"].find_one({"ingestion_id": ingestion_id})
    if not ingestion:
        raise HTTPException(status_code=404, detail=f"Ingestion job '{ingestion_id}' not found")
    return IngestionJob(**ingestion)


# Fetch ingestion config
async def get_ingestion_config(ingestion_id: str):
    ingestion = await mongodb.db["ingestion_configs"].find_one({"ingestion_id": ingestion_id})
    if not ingestion:
        raise HTTPException(status_code=404, detail=f"Ingestion config for '{ingestion_id}' not found")
    return IngestionConfigResponse(**ingestion)


# Save ingestion metadata (upsert)
async def save_metadata_in_db(ingestion_id: str, metadata: dict):
    result = await mongodb.db["metadata"].update_one(
        {"ingestion_id": ingestion_id},
        {"$set": {"ingestion_id": ingestion_id, "metadata": metadata}},
        upsert=True
    )
    return str(result)
