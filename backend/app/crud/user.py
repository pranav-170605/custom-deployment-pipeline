# from typing import Optional, List
# from bson import ObjectId
# from passlib.context import CryptContext
# from app.db.mongodb import mongodb
# from app.schemas.user import UserCreate, UserLogin, UserUpdate, User

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def get_password_hash(password: str) -> str:
#     return pwd_context.hash(password)

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)

# def format_user(user: dict) -> User:
#     return User(
#         user_id=str(user["_id"]),  # use `user_id` here
#         username=user["username"],
#         email=user["email"]
#     )


# async def create_user(user: UserCreate) -> User:
#     user_dict = user.model_dump()
#     user_dict["_id"] = ObjectId()
#     user_dict["user_id"] = str(user_dict["_id"])  # optional
#     user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
#     await mongodb.db.users.insert_one(user_dict)
#     return format_user(user_dict)

# async def get_user_by_username(username: str) -> Optional[dict]:
#     user = await mongodb.db.users.find_one({"username": username})
#     return user

# async def get_user_by_id(user_id: str) -> Optional[User]:
#     user = await mongodb.db.users.find_one({"_id": ObjectId(user_id)})
#     if user:
#         return format_user(user)
#     return None

# async def get_all_users() -> List[User]:
#     users = []
#     async for user in mongodb.db.users.find():
#         users.append(format_user(user))
#     return users

# async def update_user(user_id: str, user_update: UserUpdate) -> Optional[User]:
#     update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    
#     if "password" in update_data:
#         update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

#     if not update_data:
#         return await get_user_by_id(user_id)

#     result = await mongodb.db.users.find_one_and_update(
#         {"_id": ObjectId(user_id)},
#         {"$set": update_data},
#         return_document=True
#     )
    
#     if result:
#         return format_user(result)
#     return None

# async def delete_user(user_id: str) -> bool:
#     result = await mongodb.db.users.delete_one({"_id": ObjectId(user_id)})
#     return result.deleted_count > 0

# async def authenticate_user(username: str, password: str) -> Optional[User]:
#     user = await get_user_by_username(username)
#     if not user:
#         return None
#     if not verify_password(password, user["hashed_password"]):
#         return None
#     return format_user(user)

from typing import Optional, List
from passlib.context import CryptContext
from app.db.mongodb import mongodb
from app.schemas.user import UserCreate, UserLogin, UserUpdate, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Password hashing utilities
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Format MongoDB user doc into schema User
def format_user(user: dict) -> User:
    return User(
        user_id=user["_id"],  # now using custom ID like 'u001'
        username=user["username"],
        email=user["email"]
    )

# Custom ID generator for user_id (e.g., u001, u002, ...)
async def get_next_user_id() -> str:
    last_user = await mongodb.db.users.find_one(
        {"_id": {"$regex": "^u\\d+$"}},
        sort=[("_id", -1)]
    )

    if last_user and "_id" in last_user:
        last_id_num = int(last_user["_id"][1:])  # remove 'u'
        new_id = f"u{last_id_num + 1:03d}"        # pad with zeros
    else:
        new_id = "u001"

    return new_id

# Create user with custom user_id
async def create_user(user: UserCreate) -> User:
    user_dict = user.model_dump()
    new_user_id = await get_next_user_id()

    user_dict["_id"] = new_user_id  # custom ID
    user_dict["user_id"] = new_user_id
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))

    await mongodb.db.users.insert_one(user_dict)
    return format_user(user_dict)

# Get user by username
async def get_user_by_username(username: str) -> Optional[dict]:
    return await mongodb.db.users.find_one({"username": username})

# Get user by custom ID
async def get_user_by_id(user_id: str) -> Optional[User]:
    user = await mongodb.db.users.find_one({"_id": user_id})
    if user:
        return format_user(user)
    return None

# Get all users
async def get_all_users() -> List[User]:
    users = []
    async for user in mongodb.db.users.find():
        users.append(format_user(user))
    return users

# Update user by ID
async def update_user(user_id: str, user_update: UserUpdate) -> Optional[User]:
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}

    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))

    if not update_data:
        return await get_user_by_id(user_id)

    result = await mongodb.db.users.find_one_and_update(
        {"_id": user_id},
        {"$set": update_data},
        return_document=True
    )

    if result:
        return format_user(result)
    return None

# Delete user by ID
async def delete_user(user_id: str) -> bool:
    result = await mongodb.db.users.delete_one({"_id": user_id})
    return result.deleted_count > 0

# Authenticate user
async def authenticate_user(username: str, password: str) -> Optional[User]:
    user = await get_user_by_username(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return format_user(user)
