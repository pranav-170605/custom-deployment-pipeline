from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class FilterConfig(BaseModel):
    includes : Optional[str] = None
    excludes : Optional[str] = None

class IngestionJobBase(BaseModel):
    ingestion_type: str
    database_filter_pattern: Optional[FilterConfig] = None
    schema_filter_pattern: Optional[FilterConfig] = None
    table_filter_pattern: Optional[FilterConfig] = None
    enable_debug_log : Optional[bool] = False
    mark_deleted_tables : Optional[bool] = False

class IngestionJobCreate(IngestionJobBase):
    pass

class IngestionJob(IngestionJobBase):
    ingestion_id: str
    src_conn_id: str
    status: Optional[str] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    error_log: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 

class IngestionConfig(BaseModel):
    schedule_type : str
    frequency : Optional[str] = None
    hour : Optional[int] = None
    minute : Optional[int] = None
    retries : int

class IngestionConfigResponse(IngestionConfig):
    ingestion_config_id : str
    ingestion_id : str
    created_at : datetime
    updated_at : datetime