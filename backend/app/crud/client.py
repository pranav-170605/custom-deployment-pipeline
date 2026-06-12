from typing import Optional
from bson import ObjectId
from app.db.mongodb import mongodb
from app.schemas.client import ClientCreate
from app.models.client import ClientInDB

# async def create_client(client: ClientCreate) -> ClientInDB:
#     client_dict = client.model_dump()
#     client_dict["_id"] = ObjectId()
#     client_dict["id"] = str(client_dict["_id"])
    
#     await mongodb.db.clients.insert_one(client_dict)
#     return ClientInDB(**client_dict)

# async def get_client(client_id: str) -> Optional[ClientInDB]:
#     client = await mongodb.db.clients.find_one({"_id": ObjectId(client_id)})
#     if client:
#         client["id"] = str(client["_id"])
#         return ClientInDB(**client)
#     return None 

# async def get_next_client_id() -> str:
#     # Find the client with the highest ID (sorted descending)
#     last_client = await mongodb.db.clients.find_one(
#         {"id": {"$regex": "^c\\d+$"}},
#         sort=[("id", -1)]
#     )
    
#     if last_client and "id" in last_client:
#         last_id_num = int(last_client["id"][1:])  # Remove 'c' and convert to int
#         new_id = f"c{last_id_num + 1:03d}"        # Pad with leading zeros
#     else:
#         new_id = "c001"
    
#     return new_id

# async def create_client(client: ClientCreate) -> ClientInDB:
#     client_dict = client.model_dump()
#     new_id = await get_next_client_id()
    
#     client_dict["_id"] = new_id   # Use custom ID as MongoDB _id
#     client_dict["id"] = new_id
    
#     await mongodb.db.clients.insert_one(client_dict)
#     return ClientInDB(**client_dict)
