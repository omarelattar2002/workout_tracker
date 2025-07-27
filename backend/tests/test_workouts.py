import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.services.workout_service import WorkoutService

client = TestClient(app)

def test_create_workout_with_auth():
    # Sign up or ensure user exists
    client.post("/auth/signup", json={"username": "testuser", "password": "testpass"})

    # Log in to get token
    response = client.post("/auth/login", json={"username": "testuser", "password": "testpass"})
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create workout
    data = {
        "user_id": "testuser",
        "workout_id": "w1",
        "type": "strength",
        "sets": 3,
        "reps": 10
    }
    response = client.post("/workouts", json=data, headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Workout created successfully"

def test_service_get_workouts_sorted():
    # Test polymorphism: WorkoutService overrides get_workouts to sort results
    service = WorkoutService()

    # Mock data out of order
    workouts = [
        {"user_id": "u1", "workout_id": "b"},
        {"user_id": "u1", "workout_id": "a"}
    ]

    # Mock table.query method
    class MockTable:
        def query(self, KeyConditionExpression):
            return {"Items": workouts}

    service.table = MockTable()

    result = service.get_workouts("u1")
    assert result[0]["workout_id"] == "a"
    assert result[1]["workout_id"] == "b"
