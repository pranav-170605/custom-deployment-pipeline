from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from app.schemas.user import UserCreate, User, UserLogin, UserUpdate
from app.crud import user as user_crud
import traceback

router = APIRouter()

@router.post("/register", response_model=User, status_code=201)
async def register_user(user: UserCreate):
    try:    
        # Check if username already exists
        existing_user = await user_crud.get_user_by_username(user.username)
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        
        return await user_crud.create_user(user)
    except Exception as e:
        error_details = f"Error: {str(e)}\nTraceback: {traceback.format_exc()}"
        print(error_details)  # Log the error details
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=User)
async def login_user(user_data: UserLogin):
    user = await user_crud.authenticate_user(user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# @router.get("/", response_model=List[User])
# async def get_all_users():
#     try:
#         return await user_crud.get_all_users()
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    try:
        user = await user_crud.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: UserUpdate):
    try:
        updated_user = await user_crud.update_user(user_id, user_update)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str):
    try:
        success = await user_crud.delete_user(user_id)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))