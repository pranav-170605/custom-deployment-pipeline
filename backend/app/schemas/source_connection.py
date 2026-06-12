from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class ConnectionDetails(BaseModel):
    username: str
    password: str
    host: str
    port: int
    database: str

class SourceConnectionCreate(BaseModel):
    connection_name: str
    source_name: Literal['postgres', 'mysql', 'mssql', 'oracle','Postgres']
    connection_details: ConnectionDetails

class SourceConnectionUpdate(BaseModel):
    connection_name: Optional[str]
    source_name: Optional[Literal['postgres', 'mysql', 'mssql', 'oracle']]
    connection_details: Optional[ConnectionDetails]

class SourceConnectionInDB(SourceConnectionCreate):
    src_conn_id: str
    project_id: str
    created_at: datetime
    updated_at: datetime
