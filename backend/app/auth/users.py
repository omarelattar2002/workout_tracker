from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from app.db.dynamo_client import dynamodb
import os

router = APIRouter()

# DynamoDB users table
users_table = dynamodb.Table("users")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "secret123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Token auth
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Request model
class UserSignup(BaseModel):
    username: str
    password: str

# Create JWT
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Decode JWT
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Signup route
@router.post("/auth/signup")
def signup(user: UserSignup):
    existing = users_table.get_item(Key={"username": user.username})
    if "Item" in existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_pw = pwd_context.hash(user.password)

    users_table.put_item(Item={
        "username": user.username,
        "password": hashed_pw
    })

    return {"message": "User created successfully"}

# Login route
@router.post("/auth/login")
def login(user: UserSignup):
    result = users_table.get_item(Key={"username": user.username})
    user_item = result.get("Item")

    if not user_item:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    stored_pw = user_item["password"]
    if not pwd_context.verify(user.password, stored_pw):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": token, "token_type": "bearer"}
