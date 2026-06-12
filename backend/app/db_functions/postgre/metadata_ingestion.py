import psycopg2
import json  
from typing import Dict, List, Any
from app.crud.connection import get_connection_details
from app.crud.ingestion_crud import save_metadata_in_db

async def fetch_postgres_metadata(ingestion_id : str):
    """
    Fetches PostgreSQL metadata with strict hierarchy and original structure preservation:
    Database -> Schema -> Table -> Columns
    """
    metadata = {"databases": []}

    try:
        connection_details = await get_connection_details(ingestion_id)
        # Connect to PostgreSQL to list databases
        base_conn = psycopg2.connect(
            dbname="postgres",
            user=connection_details["username"],
            password=connection_details["password"],
            host=connection_details["host"],
            port=connection_details["port"]
        )
        base_conn.autocommit = True
        base_cursor = base_conn.cursor()

        # Get all non-template databases including postgres
        base_cursor.execute("""
            SELECT datname 
            FROM pg_database 
            WHERE datistemplate = false
            ORDER BY datname
        """)
        databases = [row[0] for row in base_cursor.fetchall()]

        for db_name in databases:
            if db_name in ["template0", "template1"]:  # Keep postgres
                continue

            db_conn = psycopg2.connect(
                dbname=db_name,
                user=connection_details["username"],
                password=connection_details["password"],
                host=connection_details["host"],
                port=connection_details["port"]
            )
            db_cursor = db_conn.cursor()

            # Database entry with schemas (always included even if empty)
            db_entry = {
                "name": db_name,
                "schemas": []
            }

            # Get non-system schemas
            db_cursor.execute("""
                SELECT schema_name
                FROM information_schema.schemata
                WHERE schema_name NOT IN (
                    'information_schema', 
                    'pg_catalog', 
                    'pg_toast',
                    'pg_temp_1',
                    'pg_toast_temp_1'
                )
                ORDER BY schema_name
            """)
            schemas = [row[0] for row in db_cursor.fetchall()]

            for schema_name in schemas:
                schema_entry = {
                    "name": schema_name,
                    "tables": []
                }

                # Get tables with original names
                db_cursor.execute("""
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = %s
                    AND table_type = 'BASE TABLE'
                    ORDER BY table_name
                """, (schema_name,))
                
                tables = [row[0] for row in db_cursor.fetchall()]

                for table_name in tables:
                    table_entry = {
                        "name": table_name,  # Preserve original names
                        "columns": []
                    }

                    # Get columns with original counts
                    db_cursor.execute("""
                        SELECT 
                            column_name,
                            data_type,
                            is_nullable = 'YES' AS is_nullable
                        FROM information_schema.columns
                        WHERE table_schema = %s
                        AND table_name = %s
                        ORDER BY ordinal_position
                    """, (schema_name, table_name))
                    
                    for col in db_cursor.fetchall():
                        table_entry["columns"].append({
                            "name": col[0],
                            "type": col[1],
                            "nullable": col[2]
                        })

                    schema_entry["tables"].append(table_entry)
                
                db_entry["schemas"].append(schema_entry)
            
            metadata["databases"].append(db_entry)
            db_cursor.close()
            db_conn.close()

        base_cursor.close()
        base_conn.close()
        response = {}
        response["ingestion_id"] = ingestion_id 
        if metadata:
            response["content"] = await save_metadata_in_db(ingestion_id, metadata) 
        else:
            response["content"] = "metadata is not saved due to an issue"


    except Exception as e:
        print(f"Error fetching metadata: {e}")
    return response

 