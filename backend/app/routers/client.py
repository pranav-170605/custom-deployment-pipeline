from fastapi import APIRouter, HTTPException
from app.schemas.client import ClientCreate, Client
from app.crud import client as client_crud

router = APIRouter()

@router.post("/", response_model=Client, status_code=201)
async def create_client(client: ClientCreate):
    try:
        return await client_crud.create_client(client)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 