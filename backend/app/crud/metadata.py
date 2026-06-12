from typing import List, Optional
from app.db.mongodb import mongodb
from app.schemas.metadata import MetadataResponse

async def get_metadata_by_ingestion_id(ingestion_id: str) -> Optional[MetadataResponse]:
    metadata = await mongodb.db.metadata.find_one({"ingestion_id": ingestion_id})
    if metadata:
        return MetadataResponse(**metadata["metadata"])
    return None

async def get_all_databases(ingestion_id: str) -> List[dict]:
    metadata = await get_metadata_by_ingestion_id(ingestion_id)
    if metadata:
        return [
            {"name": db.name, "type": db.type, "icon": db.icon}
            for db in metadata.databases
        ]
    return []

async def get_schemas_by_database(ingestion_id: str, database_name: str) -> List[str]:
    metadata = await get_metadata_by_ingestion_id(ingestion_id)
    if metadata:
        for db in metadata.databases:
            if db.name == database_name:
                return [schema.name for schema in db.schemas]
    return []

async def get_tables_by_schema(ingestion_id: str, database_name: str, schema_name: str) -> List[dict]:
    metadata = await get_metadata_by_ingestion_id(ingestion_id)
    if metadata:
        for db in metadata.databases:
            if db.name == database_name:
                for schema in db.schemas:
                    if schema.name == schema_name:
                        return [
                            {
                                "name": table.name,
                                "type": table.type if hasattr(table, 'type') else "Table",
                                "columns": len(table.columns),
                                "rows": table.rows if hasattr(table, 'rows') else None,
                                "description": table.description if hasattr(table, 'description') else None
                            }
                            for table in schema.tables
                        ]
    return []

async def get_table_details(ingestion_id: str, database_name: str, schema_name: str, table_name: str) -> Optional[dict]:
    metadata = await get_metadata_by_ingestion_id(ingestion_id)
    if metadata:
        for db in metadata.databases:
            if db.name == database_name:
                for schema in db.schemas:
                    if schema.name == schema_name:
                        for table in schema.tables:
                            if table.name == table_name:
                                return {
                                    "name": table.name,
                                    "columns": [
                                        {"name": col.name, "type": col.type, "nullable": col.nullable}
                                        for col in table.columns
                                    ],
                                    "rows": table.rows if hasattr(table, 'rows') else None,
                                    "description": table.description if hasattr(table, 'description') else None
                                }
    return None 