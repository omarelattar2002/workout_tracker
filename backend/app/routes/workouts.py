from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel
from jose import jwt, JWTError
from app.services.workout_service import WorkoutService
import os

router = APIRouter()
service = WorkoutService()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "secret123")
ALGORITHM = "HS256"


def get_username_from_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


class WorkoutBase(BaseModel):
    type: str
    sets: int
    reps: int
    weight: str | None = None


class Workout(WorkoutBase):
    workout_id: str


class UpdateWorkout(WorkoutBase):
    pass


@router.post("/workouts")
def create_workout(workout: Workout, request: Request):
    username = get_username_from_token(request)
    if not username:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Always use token username as user_id
    workout_data = workout.dict()
    workout_data["user_id"] = username
    workout_data["date"] = datetime.utcnow().isoformat()  


    return service.create_workout(workout_data)


@router.get("/workouts")
def get_workouts(request: Request):
    username = get_username_from_token(request)
    if not username:
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"workouts": service.get_workouts(username)}


@router.get("/workouts/filter")
def filter_workouts(request: Request, workout_type: str | None = None):
    username = get_username_from_token(request)
    if not username:
        raise HTTPException(status_code=403, detail="Not authorized")
    return {"workouts": service.filter_workouts(username, workout_type)}


@router.get("/workouts/report")
def generate_report(request: Request):
    username = get_username_from_token(request)
    if not username:
        raise HTTPException(status_code=403, detail="Not authorized")
    csv_data = service.generate_report_csv(username)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=workout_report_{username}.csv"}
    )


@router.put("/workouts/{workout_id}")
def update_workout(workout_id: str, update: UpdateWorkout, request: Request):
    username = get_username_from_token(request)
    if not username:
        raise HTTPException(status_code=403, detail="Not authorized")

    existing_items = service.get_workouts(username)
    match = next((w for w in existing_items if w["workout_id"] == workout_id), None)

    if not match:
        raise HTTPException(status_code=404, detail="This workout does not exist")

    update_expr = ["#t = :t", "#s = :s", "#r = :r"]
    expr_attr_names = {"#t": "type", "#s": "sets", "#r": "reps"}
    expr_attr_values = {":t": update.type, ":s": update.sets, ":r": update.reps}

    if update.weight is not None:
        update_expr.append("#w = :w")
        expr_attr_names["#w"] = "weight"
        expr_attr_values[":w"] = update.weight

    service.table.update_item(
        Key={"user_id": username, "workout_id": workout_id},
        UpdateExpression="SET " + ", ".join(update_expr),
        ExpressionAttributeNames=expr_attr_names,
        ExpressionAttributeValues=expr_attr_values
    )

    return {"message": "Workout updated successfully"}


@router.delete("/workouts/{workout_id}")
def delete_workout(workout_id: str, request: Request):
    username = get_username_from_token(request)
    if not username:
        raise HTTPException(status_code=403, detail="Not authorized")

    existing_items = service.get_workouts(username)
    match = next((w for w in existing_items if w["workout_id"] == workout_id), None)

    if not match:
        raise HTTPException(status_code=404, detail="Workout not found")

    service.table.delete_item(Key={"user_id": username, "workout_id": workout_id})
    return {"message": "Workout has been deleted"}
