from fastapi import APIRouter
from pydantic import BaseModel
from app.db.dynamo_client import dynamodb
from fastapi import HTTPException



router = APIRouter()


class Workout(BaseModel):
    user_id: str
    workout_id: str
    type: str

@router.post("/workouts")
def create_workout(workout: Workout):
    table = dynamodb.Table("workouts")

    table.put_item(Item={
        "user_id": workout.user_id,
        "workout_id": workout.workout_id,
        "type": workout.type
    })

    return {"message": "Workout created successfully"}



@router.get("/workouts/{user_id}")
def get_workouts(user_id: str):
    table = dynamodb.Table("workouts")

    response = table.query(
        KeyConditionExpression="user_id = :uid",
        ExpressionAttributeValues={":uid": user_id}
    )

    return {"workouts": response.get("Items", [])}


@router.put("/workouts/{user_id}/{workout_id}")
def update_workout(user_id: str, workout_id: str, new_type: str):
    table = dynamodb.Table("workouts")

    existing = table.get_item(Key={"user_id": user_id, "workout_id":workout_id})
    if "Item" not in existing:
        raise HTTPException(status_code=404, detail="This Workout Does not exist")
    
    table.update_item(
        Key={"user_id": user_id, "workout_id": workout_id},
        UpdateExpression="SET #t = :new",
        ExpressionAttributeNames={"#t": "type"},
        ExpressionAttributeValues={":new": new_type}
    )

    return {"message":"Workout updated successfully"}

@router.delete("/workouts/{user_id}/{workout_id}")
def delete_workout(user_id: str, workout_id: str):
    table = dynamodb.Table("workouts")

    existing = table.get_item(Key={
        "user_id": user_id,
        "workout_id":workout_id
    })

    if "Item" not in existing:
        raise HTTPException(status_code=404, detail= "Workout not found")
    
    table.delete_item(Key={
        "user_id":user_id,
        "workout_id": workout_id
    })

    return{"message":"Workout has been deleted"}