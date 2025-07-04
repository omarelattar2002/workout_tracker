from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import workouts
from app.auth import users
from app.db.dynamo_client import create_workouts_table, create_users_table

load_dotenv()

app = FastAPI()

allowed_origins = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_workouts_table()
create_users_table()

app.include_router(users.router)
app.include_router(workouts.router)

@app.get("/")
def root():
    return {"message": "Workout Tracker API is running"}
