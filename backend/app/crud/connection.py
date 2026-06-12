from bson import ObjectId
from fastapi import HTTPException
from app.db.mongodb import mongodb
from app.db_functions.postgre.connection_tester import test_postgres_connection  # Add more as needed

async def test_connection_by_id(src_conn_id: str) -> dict:
    # Fetch source connection from Mongo
    conn = await mongodb.db["source_connections"].find_one({"_id": ObjectId(src_conn_id)})
    if not conn:
        raise HTTPException(status_code=404, detail="Source connection not found")

    source_type = conn["source_name"].lower()
    details = conn["connection_details"]

    # Match by source type
    if source_type == "postgres":
        return await test_postgres_connection(details)
    
    raise HTTPException(status_code=400, detail=f"Unsupported source type: {source_type}")

async def get_connection_details(ingestion_id : str):
    ingestion_details = await mongodb.db["ingestion_jobs"].find_one({"ingestion_id": ingestion_id})
    connection_id = ingestion_details["src_conn_id"]
    connection_details = await mongodb.db["source_connections"].find_one({"src_conn_id" : connection_id})
    return connection_details['connection_details']
