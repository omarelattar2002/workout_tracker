import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_signup_and_login():
    # Step 1: Sign up a new user
    signup_data = {"username": "testuser", "password": "testpass"}
    response = client.post("/auth/signup", json=signup_data)
    assert response.status_code == 200 or response.status_code == 400

    # Step 2: Log in with same credentials
    login_data = {"username": "testuser", "password": "testpass"}
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
