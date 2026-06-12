import asyncpg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
# from app.crud.connection_tester import test_connection_by_id

router = APIRouter()

# @router.get("/test-connection/{src_conn_id}", response_model=dict)
# async def test_source_connection(src_conn_id: str):
#     return await test_connection_by_id(src_conn_id)

class PostgresConnectionInfo(BaseModel):
    username: str
    password: str
    host: str
    port: int
    database: str

@router.post("/test-postgres-connection")
async def test_postgres_connection(info: PostgresConnectionInfo):
    dsn = f"postgresql://{info.username}:{info.password}@{info.host}:{info.port}/{info.database}"
    try:
        conn = await asyncpg.connect(dsn)
        await conn.execute("SELECT 1")
        await conn.close()
        return {"status": "success", "message": "PostgreSQL connection successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))