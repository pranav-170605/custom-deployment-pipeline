# from datetime import datetime
# from typing import List, Optional
# from bson import ObjectId
# from app.db.mongodb import mongodb


# # Check if user exists
# async def user_exists(user_id: str) -> bool:
#     return await mongodb.db["users"].find_one({"_id": ObjectId(user_id)}) is not None


# # Create Workspace + Project
# async def create_workspace_with_project(data: dict, user_id: str) -> dict:
#     if not await user_exists(user_id):
#         raise ValueError("User not found")

#     now = datetime.utcnow()

#     # Create workspace
#     workspace_data = {
#         "name": data["name"],
#         "description": data.get("description"),
#         "user_id": user_id,
#         "created_at": now,
#         "updated_at": now
#     }
#     ws_result = await mongodb.db["workspaces"].insert_one(workspace_data)
#     workspace_id = str(ws_result.inserted_id)

#     await mongodb.db["workspaces"].update_one(
#         {"_id": ws_result.inserted_id},
#         {"$set": {"workspace_id": workspace_id}}
#     )

#     # Create project
#     project = data["project"]
#     project_data = {
#         "workspace_id": workspace_id,
#         "name": project["name"],
#         "description": project.get("description"),
#         "created_at": now,
#         "updated_at": now
#     }
#     pr_result = await mongodb.db["projects"].insert_one(project_data)
#     project_id = str(pr_result.inserted_id)

#     await mongodb.db["projects"].update_one(
#         {"_id": pr_result.inserted_id},
#         {"$set": {"project_id": project_id}}
#     )

#     return {
#         "workspace_id": workspace_id,
#         "name": data["name"],
#         "description": data.get("description"),
#         "user_id": user_id,
#         "created_at": now,
#         "updated_at": now,
#         "project": {
#             "project_id": project_id,
#             "name": project["name"],
#             "description": project.get("description"),
#         }
#     }
# # Get all workspaces and their projects for a user
# async def get_user_workspaces_with_projects(user_id: str) -> List[dict]:
#     workspace_cursor = mongodb.db["workspaces"].find({"user_id": user_id})
#     workspaces_with_projects = []

#     async for ws_doc in workspace_cursor:
#         workspace_id = ws_doc["workspace_id"]
        
#         # Fetch all projects for the workspace
#         project_cursor = mongodb.db["projects"].find({"workspace_id": workspace_id})
#         projects = [
#             {
#                 "project_id": p["project_id"],
#                 "workspace_id": p["workspace_id"],
#                 "name": p["name"],
#                 "description": p.get("description"),
#                 "created_at": p["created_at"],
#                 "updated_at": p["updated_at"]
#             }
#             async for p in project_cursor
#         ]

#         # Combine workspace and its projects
#         workspaces_with_projects.append({
#             "workspace_id": ws_doc["workspace_id"],
#             "name": ws_doc["name"],  # Make sure your schema uses workspace_name
#             "description": ws_doc.get("description"),
#             "user_id": ws_doc["user_id"],
#             "created_at": ws_doc["created_at"],
#             "updated_at": ws_doc["updated_at"],
#             "projects": projects
#         })

#     return workspaces_with_projects


# # Get single workspace (with projects)
# async def get_workspace(workspace_id: str) -> Optional[dict]:
#     doc = await mongodb.db["workspaces"].find_one({"workspace_id": workspace_id})
#     if not doc:
#         return None

#     projects_cursor = mongodb.db["projects"].find({"workspace_id": workspace_id})
#     projects = [
#         {
#             "project_id": p["project_id"],
#             "workspace_id": p["workspace_id"],
#             "name": doc["workspace_name"],
#             "description": p.get("description"),
#             "created_at": p["created_at"],
#             "updated_at": p["updated_at"]
#         }
#         async for p in projects_cursor
#     ]
#     return {
#         "workspace_id": doc["workspace_id"],
#         "name": doc["workspace_name"],
#         "description": doc.get("description"),
#         "user_id": doc["user_id"],
#         "created_at": doc["created_at"],
#         "updated_at": doc["updated_at"],
#         "projects": projects
#     }


# # Update workspace only
# async def update_workspace(workspace_id: str, update_data: dict) -> Optional[dict]:
#     update_data["updated_at"] = datetime.utcnow()
#     result = await mongodb.db["workspaces"].update_one(
#         {"workspace_id": workspace_id},
#         {"$set": update_data}
#     )
#     if result.modified_count:
#         return await mongodb.db["workspaces"].find_one({"workspace_id": workspace_id})
#     return None


# # Delete workspace and its projects
# async def delete_workspace(workspace_id: str) -> bool:
#     await mongodb.db["projects"].delete_many({"workspace_id": workspace_id})
#     result = await mongodb.db["workspaces"].delete_one({"workspace_id": workspace_id})
#     return result.deleted_count > 0


from datetime import datetime
from typing import List, Optional
from app.db.mongodb import mongodb


# Check if user exists using string _id (not ObjectId)
async def user_exists(user_id: str) -> bool:
    return await mongodb.db["users"].find_one({"_id": user_id}) is not None


# Helper to generate next custom ID (like w001 or p001)
async def get_next_id(collection_name: str, prefix: str, id_field: str) -> str:
    latest = await mongodb.db[collection_name].find_one(
        {id_field: {"$regex": f"^{prefix}\\d+$"}},
        sort=[(id_field, -1)]
    )
    if latest:
        number = int(latest[id_field][1:]) + 1
    else:
        number = 1
    return f"{prefix}{str(number).zfill(3)}"


# Create Workspace + Project
async def create_workspace_with_project(data: dict, user_id: str) -> dict:
    if not await user_exists(user_id):
        raise ValueError("User not found")

    now = datetime.utcnow()

    # Generate custom workspace_id
    workspace_id = await get_next_id("workspaces", "w", "workspace_id")

    # Create workspace
    workspace_data = {
        "workspace_id": workspace_id,
        "name": data["name"],
        "description": data.get("description"),
        "user_id": user_id,
        "created_at": now,
        "updated_at": now
    }
    await mongodb.db["workspaces"].insert_one(workspace_data)

    # Generate custom project_id
    project = data["project"]
    project_id = await get_next_id("projects", "p", "project_id")

    # Create project
    project_data = {
        "project_id": project_id,
        "workspace_id": workspace_id,
        "name": project["name"],
        "description": project.get("description"),
        "created_at": now,
        "updated_at": now
    }
    await mongodb.db["projects"].insert_one(project_data)

    # Return structured response
    return {
        "workspace_id": workspace_id,
        "name": data["name"],
        "description": data.get("description"),
        "user_id": user_id,
        "created_at": now,
        "updated_at": now,
        "project": {
            "project_id": project_id,
            "name": project["name"],
            "description": project.get("description")
        }
    }


# Get all workspaces and their projects for a user
async def get_user_workspaces_with_projects(user_id: str) -> List[dict]:
    workspace_cursor = mongodb.db["workspaces"].find({"user_id": user_id})
    workspaces_with_projects = []

    async for ws_doc in workspace_cursor:
        workspace_id = ws_doc["workspace_id"]

        # Fetch projects under this workspace
        project_cursor = mongodb.db["projects"].find({"workspace_id": workspace_id})
        projects = [
            {
                "project_id": p["project_id"],
                "workspace_id": p["workspace_id"],
                "name": p["name"],
                "description": p.get("description"),
                "created_at": p["created_at"],
                "updated_at": p["updated_at"]
            }
            async for p in project_cursor
        ]

        workspaces_with_projects.append({
            "workspace_id": ws_doc["workspace_id"],
            "name": ws_doc["name"],  # Make sure your schema uses workspace_name
            "description": ws_doc.get("description"),
            "user_id": ws_doc["user_id"],
            "created_at": ws_doc["created_at"],
            "updated_at": ws_doc["updated_at"],
            "projects": projects
        })

    return workspaces_with_projects


# Get single workspace (with projects)
async def get_workspace(workspace_id: str) -> Optional[dict]:
    doc = await mongodb.db["workspaces"].find_one({"workspace_id": workspace_id})
    if not doc:
        return None

    projects_cursor = mongodb.db["projects"].find({"workspace_id": workspace_id})
    projects = [
        {
            "project_id": p["project_id"],
            "workspace_id": p["workspace_id"],
            "name": p["name"],
            "description": p.get("description"),
            "created_at": p["created_at"],
            "updated_at": p["updated_at"]
        }
        async for p in projects_cursor
    ]

    return {
        "workspace_id": doc["workspace_id"],
        "name": doc["name"],
        "description": doc.get("description"),
        "user_id": doc["user_id"],
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
        "projects": projects
    }


# Update workspace only
async def update_workspace(workspace_id: str, update_data: dict) -> Optional[dict]:
    update_data["updated_at"] = datetime.utcnow()
    result = await mongodb.db["workspaces"].update_one(
        {"workspace_id": workspace_id},
        {"$set": update_data}
    )
    if result.modified_count:
        return await mongodb.db["workspaces"].find_one({"workspace_id": workspace_id})
    return None


# Delete workspace and its projects
async def delete_workspace(workspace_id: str) -> bool:
    await mongodb.db["projects"].delete_many({"workspace_id": workspace_id})
    result = await mongodb.db["workspaces"].delete_one({"workspace_id": workspace_id})
    return result.deleted_count > 0
