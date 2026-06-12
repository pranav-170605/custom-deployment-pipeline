from datetime import datetime
from bson import ObjectId
from typing import List, Optional
from app.db.mongodb import mongodb


async def get_projects_by_workspace(workspace_id: str) -> List[dict]:
    cursor = mongodb.db["projects"].find({"workspace_id": workspace_id})
    projects = []
    async for doc in cursor:
        projects.append({
            "project_id": doc["project_id"],
            "workspace_id": doc["workspace_id"],
            "name": doc["name"],
            "description": doc.get("description"),
            "created_at": doc["created_at"],
            "updated_at": doc["updated_at"]
        })
    return projects


async def get_project_by_id(project_id: str) -> Optional[dict]:
    doc = await mongodb.db["projects"].find_one({"_id": ObjectId(project_id)})
    if doc:
        return {
            "project_id": doc["project_id"],
            "workspace_id": doc["workspace_id"],
            "name": doc["name"],
            "description": doc.get("description"),
            "created_at": doc["created_at"],
            "updated_at": doc["updated_at"]
        }
    return None


async def update_project(project_id: str, update_data: dict) -> Optional[dict]:
    update_data["updated_at"] = datetime.utcnow()

    result = await mongodb.db["projects"].update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data}
    )

    if result.modified_count == 1:
        return await get_project_by_id(project_id)
    return None


async def delete_project(project_id: str) -> bool:
    result = await mongodb.db["projects"].delete_one({"_id": ObjectId(project_id)})
    return result.deleted_count == 1
