# EDA (Enterprise Data Analytics) API

A FastAPI-based backend service for managing and analyzing metadata from various databases.

## Features

- User registration and authentication
- Client management
- MongoDB integration
- OpenAPI documentation

## Prerequisites

- Python 3.8+
- MongoDB

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root directory with:
   ```
   MONGODB_URL=mongodb://localhost:27017
   ```

## Running the Application

1. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
2. Access the API documentation at: http://localhost:8000/docs

## API Endpoints

- POST /users/register - Register a new user
- POST /users/login - User login
- POST /clients - Create a new client

## Development

The project structure follows a modular design:

- `app/` - Main application package
  - `core/` - Core functionality
  - `crud/` - Database operations
  - `db/` - Database configuration
  - `models/` - Database models
  - `routers/` - API endpoints
  - `schemas/` - Pydantic models 