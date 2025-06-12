from fastapi import FastAPI
from app.routes import workouts
from app.auth import users
from dotenv import load_dotenv
from app.db.dynamo_client import create_workouts_table


load_dotenv()

app = FastAPI()

create_workouts_table()

app.include_router(users.router)
app.include_router(workouts.router)

@app.get("/")
def root():
    return {"message": "Workout Tracker API is running"}
