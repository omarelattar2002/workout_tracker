from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from boto3.dynamodb.conditions import Key
from app.db.dynamo_client import dynamodb
from app.auth.users import get_current_user

router = APIRouter()

class Workout(BaseModel):
    user_id: str
    workout_id: str
    type: str
    sets: int
    reps:int
    weight: str

class UpdateWorkout(BaseModel):
    new_type:str
    new_sets:int
    new_reps:int
    new_weight: str | None = None

@router.post("/workouts")
def create_workout(workout: Workout, current_user: str = Depends(get_current_user)):
    if workout.user_id != current_user:
        raise HTTPException(status_code=403, detail="You can only add workouts to your own account")

    table = dynamodb.Table("workouts")
    table.put_item(Item={
        "user_id": workout.user_id,
        "workout_id": workout.workout_id,
        "type": workout.type,
        "sets": workout.sets,
        "reps" : workout.reps,
        "weight":workout.weight
    })
    return {"message": "Workout created successfully"}

@router.get("/workouts/{user_id}")
def get_workouts(user_id: str, current_user: str = Depends(get_current_user)):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's workouts")

    table = dynamodb.Table("workouts")
    response = table.query(KeyConditionExpression=Key("user_id").eq(user_id))
    return {"workouts": response.get("Items", [])}

@router.put("/workouts/{user_id}/{workout_id}")
def update_workout(
    user_id: str,
    workout_id: str,
    update: UpdateWorkout,
    current_user: str = Depends(get_current_user)
):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to update this workout")

    table = dynamodb.Table("workouts")
    existing = table.get_item(Key={"user_id": user_id, "workout_id": workout_id})

    if "Item" not in existing:
        raise HTTPException(status_code=404, detail="This workout does not exist")


    update_expr = ["#t = :t", "#s = :s", "#r = :r"]
    expr_attr_names = {"#t": "type", "#s": "sets", "#r": "reps"}
    expr_attr_values = {
        ":t": update.new_type,
        ":s": update.new_sets,
        ":r": update.new_reps
    }

    if update.new_weight is not None:
        update_expr.append("#w = :w")
        expr_attr_names["#w"] = "weight"
        expr_attr_values[":w"] = update.new_weight

    table.update_item(
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

    table = dynamodb.Table("workouts")
    existing = table.get_item(Key={"user_id": user_id, "workout_id": workout_id})

    if "Item" not in existing:
        raise HTTPException(status_code=404, detail="Workout not found")

    table.delete_item(Key={"user_id": user_id, "workout_id": workout_id})
    return {"message": "Workout has been deleted"}
