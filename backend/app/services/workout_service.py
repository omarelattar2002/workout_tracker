from boto3.dynamodb.conditions import Key
from app.db.dynamo_client import dynamodb


class BaseWorkoutService:
    def __init__(self):
        self.table = dynamodb.Table("workouts")

    def get_workouts(self, user_id: str):
        """Generic method to get workouts for a user"""
        response = self.table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        return response.get("Items", [])

    def create_workout(self, workout_data: dict):
        """Generic method to create a workout"""
        self.table.put_item(Item=workout_data)
        return {"message": "Workout created successfully"}


class WorkoutService(BaseWorkoutService):
    def get_workouts(self, user_id: str):
        """Override method to add sorting by workout_id"""
        items = super().get_workouts(user_id)
        return sorted(items, key=lambda x: x.get("workout_id", ""))
