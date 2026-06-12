from fastapi import APIRouter, HTTPException
from app.db.mongodb import mongodb
import asyncpg

router = APIRouter()

async def fetch_postgres_metadata(conn_details):
    try:
        conn = await asyncpg.connect(
            user=conn_details["username"],
            password=conn_details["password"],
            database=conn_details["database"],
            host=conn_details["host"],
            port=conn_details.get("port", 5432)
        )

        # Queries/sec estimate (transactions)
        qps_row = await conn.fetchrow("SELECT sum(xact_commit + xact_rollback) as total_tx FROM pg_stat_database;")
        queries_per_sec = str(qps_row["total_tx"]) if qps_row else "Unknown"

        # User roles
        roles = await conn.fetch("SELECT rolname FROM pg_roles;")
        user_roles = [r["rolname"] for r in roles]

        # SSL status
        ssl_row = await conn.fetchrow("SHOW ssl;")
        ssl_enabled = ssl_row["ssl"] if ssl_row else "Unknown"

        await conn.close()

        return {
            "queries_per_sec": queries_per_sec,
            "user_roles": user_roles,
            "ssl_enabled": ssl_enabled,
            "cpu_usage": "Unavailable in SQL",
            "memory_usage": "Unavailable in SQL",
            "last_backup": "Not Tracked"
        }

    except Exception as e:
        print("Metadata fetch error:", e)
        return {
            "queries_per_sec": "Unknown",
            "user_roles": "Unknown",
            "ssl_enabled": "Unknown",
            "cpu_usage": "Unknown",
            "memory_usage": "Unknown",
            "last_backup": "Unknown"
        }

@router.get("/ingestion_metadata/{ingestion_id}")
async def get_ingestion_metadata(ingestion_id: str):
    ingestion = await mongodb.db["ingestion_jobs"].find_one({"ingestion_id": ingestion_id})
    if not ingestion:
        raise HTTPException(status_code=404, detail="Ingestion job not found")

    src_conn_id = ingestion.get("src_conn_id")
    source_connection = await mongodb.db["source_connections"].find_one({"src_conn_id": src_conn_id})
    if not source_connection:
        raise HTTPException(status_code=404, detail="Source connection not found")

    source_name = source_connection.get("source_name", "Unknown")
    connection_details = source_connection.get("connection_details", {})
    host = connection_details.get("host", "Unknown")
    database = connection_details.get("database", "Unknown")

    metadata = await fetch_postgres_metadata(connection_details)

    return {
        "overview": {
            "database": database,
            "server": host,
            "source_name": source_name,
            "running_since": "Unknown"
        },
        "performance": {
            "cpu_usage": metadata["cpu_usage"],
            "memory_usage": metadata["memory_usage"],
            "queries_per_sec": metadata["queries_per_sec"]
        },
        "security": {
            "user_roles": metadata["user_roles"],
            "ssl_enabled": metadata["ssl_enabled"],
            "last_backup": metadata["last_backup"]
        }
    }
