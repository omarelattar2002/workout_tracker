import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

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
        "type": "strength"
    }
    response = client.post("/workouts", json=data, headers=headers)
    assert response.status_code == 200
    assert response.json()["message"] == "Workout created successfully"
