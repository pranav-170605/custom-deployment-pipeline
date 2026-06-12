import sys, os
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- Import CORS middleware
from app.db.mongodb import mongodb
from app.routers import client, user, workspace, project, source_connection, ingestion, connection_tester, metadata , usage
import uvicorn

app = FastAPI(
    title="EDA (Exploratory Data Analysis) API",
    description="API for managing and analyzing metadata from various databases.",
    version="1.0.0"
)

# Define your allowed origins here
origins = ["*"]

# Add CORS middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # allows specific origins
    allow_credentials=True,
    allow_methods=["*"],          # allows all HTTP methods
    allow_headers=["*"],          # allows all headers
)

@app.on_event("startup")
async def startup_db_client():
    await mongodb.connect_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    await mongodb.close_db()

app.include_router(client.router, prefix="/clients", tags=["clients"])
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(workspace.router, prefix="/workspaces", tags=["workspaces and projects"])
app.include_router(source_connection.router, prefix="/source-connections", tags=["Source Connections"])
app.include_router(project.router, prefix="/projects", tags=["Projects"])
app.include_router(source_connection.router, prefix="/source-connections", tags=["Source Connections"])
app.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
app.include_router(connection_tester.router, prefix="/connection-tester", tags=["connection tester"])
app.include_router(metadata.router, prefix="/metadata", tags=["metadata"])
app.include_router(usage.router, prefix="/usage", tags=["usage"])

@app.get("/")
async def root():
    return {"message": "Welcome to EDA API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    print("Welcome")
