from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth.users import get_current_user
from app.services.workout_service import WorkoutService

router = APIRouter()
service = WorkoutService()


class WorkoutBase(BaseModel):
    type: str
    sets: int
    reps: int
    weight: str | None = None

class Workout(WorkoutBase):
    user_id: str
    workout_id: str

class UpdateWorkout(WorkoutBase):
    pass  

@router.post("/workouts")
def create_workout(workout: Workout, current_user: str = Depends(get_current_user)):
    if workout.user_id != current_user:
        raise HTTPException(status_code=403, detail="You can only add workouts to your own account")

    return service.create_workout(workout.dict())

@router.get("/workouts/{user_id}")
def get_workouts(user_id: str, current_user: str = Depends(get_current_user)):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's workouts")

    return {"workouts": service.get_workouts(user_id)}

@router.put("/workouts/{user_id}/{workout_id}")
def update_workout(
    user_id: str,
    workout_id: str,
    update: UpdateWorkout,
    current_user: str = Depends(get_current_user)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to update this workout")

    
    existing_items = service.get_workouts(user_id)
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
        Key={"user_id": user_id, "workout_id": workout_id},
        UpdateExpression="SET " + ", ".join(update_expr),
        ExpressionAttributeNames=expr_attr_names,
        ExpressionAttributeValues=expr_attr_values
    )

    return {"message": "Workout updated successfully"}

@router.delete("/workouts/{user_id}/{workout_id}")
def delete_workout(user_id: str, workout_id: str, current_user: str = Depends(get_current_user)):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to delete this workout")

    existing_items = service.get_workouts(user_id)
    match = next((w for w in existing_items if w["workout_id"] == workout_id), None)

    if not match:
        raise HTTPException(status_code=404, detail="Workout not found")

    service.table.delete_item(Key={"user_id": user_id, "workout_id": workout_id})
    return {"message": "Workout has been deleted"}
