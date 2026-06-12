# from datetime import datetime
# from pytz import timezone
# from bson import ObjectId
# from typing import List, Optional
# from app.db.mongodb import mongodb

# IST = timezone("Asia/Kolkata")

# async def create_source_connection(project_id: str, conn_data: dict) -> dict:
#     now = datetime.now(IST)
#     conn_data.update({
#         "project_id": project_id,
#         "created_at": now,
#         "updated_at": now
#     })

#     result = await mongodb.db["source_connections"].insert_one(conn_data)
#     inserted_id = str(result.inserted_id)

#     await mongodb.db["source_connections"].update_one(
#         {"_id": ObjectId(inserted_id)},
#         {"$set": {"src_conn_id": inserted_id}}
#     )

#     conn_data["src_conn_id"] = inserted_id
#     conn_data["_id"] = inserted_id
#     return conn_data


# async def get_connections_by_project(project_id: str) -> List[dict]:
#     cursor = mongodb.db["source_connections"].find({"project_id": project_id})
#     connections = []
#     async for doc in cursor:
#         connections.append({
#             "src_conn_id": str(doc["_id"]),
#             "project_id": doc["project_id"],
#             "connection_name": doc["connection_name"],
#             "description": doc.get("description"),
#             "source_name": doc["source_name"],
#             "connection_details": doc["connection_details"],
#             "created_at": doc["created_at"],
#             "updated_at": doc["updated_at"]
#         })
#     return connections

# async def get_connection_by_id(src_conn_id: str) -> Optional[dict]:
#     doc = await mongodb.db["source_connections"].find_one({"_id": ObjectId(src_conn_id)})
#     if not doc:
#         return None
#     return {
#         "src_conn_id": str(doc["_id"]),
#         "project_id": doc["project_id"],
#         "connection_name": doc["connection_name"],
#         "description": doc.get("description"),
#         "source_name": doc["source_name"],
#         "connection_details": doc["connection_details"],
#         "created_at": doc["created_at"],
#         "updated_at": doc["updated_at"]
#     }

# async def update_source_connection(src_conn_id: str, update_data: dict) -> Optional[dict]:
#     update_data["updated_at"] = datetime.now(IST)

#     result = await mongodb.db["source_connections"].update_one(
#         {"_id": ObjectId(src_conn_id)},
#         {"$set": update_data}
#     )

#     if result.modified_count:
#         return await get_connection_by_id(src_conn_id)
#     return None

# async def delete_source_connection(src_conn_id: str) -> bool:
#     result = await mongodb.db["source_connections"].delete_one({"_id": ObjectId(src_conn_id)})
#     return result.deleted_count > 0

from datetime import datetime
from pytz import timezone
from typing import List, Optional
from app.db.mongodb import mongodb

IST = timezone("Asia/Kolkata")

# Helper function to generate next custom src_conn_id
async def get_next_src_conn_id() -> str:
    latest = await mongodb.db["source_connections"].find_one(
        {"src_conn_id": {"$regex": "^s\\d+$"}},
        sort=[("src_conn_id", -1)]
    )
    if latest:
        number = int(latest["src_conn_id"][1:]) + 1
    else:
        number = 1
    return f"s{str(number).zfill(3)}"


# Create a new source connection with custom ID
async def create_source_connection(project_id: str, conn_data: dict) -> dict:
    now = datetime.now(IST)
    src_conn_id = await get_next_src_conn_id()

    conn_data.update({
        "src_conn_id": src_conn_id,
        "project_id": project_id,
        "created_at": now,
        "updated_at": now
    })

    await mongodb.db["source_connections"].insert_one(conn_data)
    return conn_data


# Get all source connections for a project
async def get_connections_by_project(project_id: str) -> List[dict]:
    cursor = mongodb.db["source_connections"].find({"project_id": project_id})
    connections = []
    async for doc in cursor:
        connections.append({
            "src_conn_id": doc["src_conn_id"],
            "project_id": doc["project_id"],
            "connection_name": doc["connection_name"],
            "description": doc.get("description"),
            "source_name": doc["source_name"],
            "connection_details": doc["connection_details"],
            "created_at": doc["created_at"],
            "updated_at": doc["updated_at"]
        })
    return connections


# Get single source connection by custom src_conn_id
async def get_connection_by_id(src_conn_id: str) -> Optional[dict]:
    doc = await mongodb.db["source_connections"].find_one({"src_conn_id": src_conn_id})
    if not doc:
        return None
    return {
        "src_conn_id": doc["src_conn_id"],
        "project_id": doc["project_id"],
        "connection_name": doc["connection_name"],
        "description": doc.get("description"),
        "source_name": doc["source_name"],
        "connection_details": doc["connection_details"],
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"]
    }


# Update a source connection
async def update_source_connection(src_conn_id: str, update_data: dict) -> Optional[dict]:
    update_data["updated_at"] = datetime.now(IST)

    result = await mongodb.db["source_connections"].update_one(
        {"src_conn_id": src_conn_id},
        {"$set": update_data}
    )

    if result.modified_count:
        return await get_connection_by_id(src_conn_id)
    return None


# Delete a source connection
async def delete_source_connection(src_conn_id: str) -> bool:
    result = await mongodb.db["source_connections"].delete_one({"src_conn_id": src_conn_id})
    return result.deleted_count > 0
