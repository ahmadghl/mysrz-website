from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings
from app.schemas.schemas import LoginRequest, TokenResponse

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Simple single-user auth (extend with Supabase Auth for multi-user)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD_HASH = pwd_context.hash("changeme123")  # Change via env


def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    if payload.username != ADMIN_USERNAME or not pwd_context.verify(payload.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(401, "Invalid credentials")
    token = create_token({"sub": payload.username})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
async def me(user=Depends(verify_token)):
    return {"username": user["sub"]}
