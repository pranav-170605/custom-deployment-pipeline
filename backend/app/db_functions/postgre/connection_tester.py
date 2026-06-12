import asyncpg
from fastapi import HTTPException

async def test_postgres_connection(details: dict):
    try:
        conn = await asyncpg.connect(
            user=details["username"],
            password=details["password"],
            database=details["database"],
            host=details["host"],
            port=details["port"]
        )
        await conn.close()
        return {"message": "Postgres connection successful!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Postgres connection failed: {str(e)}")
