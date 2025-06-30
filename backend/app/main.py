from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import workouts
from app.auth import users
from app.db.dynamo_client import create_workouts_table, create_users_table

load_dotenv()

app = FastAPI()

origins_env = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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
