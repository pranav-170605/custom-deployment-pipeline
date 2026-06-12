from typing import List, Optional
from pydantic import BaseModel

class Column(BaseModel):
    name: str
    type: str
    nullable: bool

class Table(BaseModel):
    name: str
    columns: List[Column]
    rows: Optional[int] = None
    description: Optional[str] = None
    type: Optional[str] = "Table"

class Schema(BaseModel):
    name: str
    tables: List[Table]

class Database(BaseModel):
    name: str
    schemas: List[Schema]
    type: Optional[str] = None  # e.g., 'postgres', 'analytics'
    icon: Optional[str] = None  # for UI icon if needed

class MetadataResponse(BaseModel):
    databases: List[Database] 