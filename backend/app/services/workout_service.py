from boto3.dynamodb.conditions import Key
from app.db.dynamo_client import dynamodb
import csv
import io


class BaseWorkoutService:
    def __init__(self):
        self.table = dynamodb.Table("workouts")

    def get_workouts(self, user_id: str):
        response = self.table.query(
            KeyConditionExpression=Key("user_id").eq(user_id)
        )
        return response.get("Items", [])

    def create_workout(self, workout_data: dict):
        self.table.put_item(Item=workout_data)
        return {"message": "Workout created successfully"}


class WorkoutService(BaseWorkoutService):
    def get_workouts(self, user_id: str):
        items = super().get_workouts(user_id)
        return sorted(items, key=lambda x: x.get("workout_id", ""))

    def filter_workouts(self, user_id: str, workout_type: str | None = None):
        items = self.get_workouts(user_id)
        if workout_type:
            items = [w for w in items if w.get("type", "").lower() == workout_type.lower()]
        return items

    def generate_report_csv(self, user_id: str):
        items = self.get_workouts(user_id)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Workout ID", "Type", "Sets", "Reps", "Weight", "Date"])
        for w in items:
            writer.writerow([
        w.get("workout_id", ""),
        w.get("type", ""),
        w.get("sets", ""),
        w.get("reps", ""),
        w.get("weight", ""),
        w.get("date", "")
    ])

        output.seek(0)
        return output.getvalue()
