# /opt/srz-crawl/app/auth/middleware.py
import os
from typing import Optional
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from loguru import logger

from app.utils.dynamic_supabase import get_supabase_client

security = HTTPBearer()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

ROLES = {
    "admin": 3,
    "editor": 2,
    "viewer": 1,
}


class CurrentUser:
    def __init__(self, user_id: str, email: str, role: str = "admin"):
        self.user_id = user_id
        self.email = email
        self.role = role

    def has_role(self, required_role: str) -> bool:
        return ROLES.get(self.role, 0) >= ROLES.get(required_role, 0)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUser:
    token = credentials.credentials
    try:
        # Verify token with Supabase
        supabase = get_supabase_client()
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
        user = response.user
        user_id = user.id
        email = user.email or ""

        # Check team role
        role = await _get_user_role(user_id, token)
        return CurrentUser(user_id=user_id, email=email, role=role)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )


async def _get_user_role(user_id: str, token: str) -> str:
    """Get user's role - check if they're a team member of another account."""
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("team_members")
            .select("role, account_owner_id")
            .eq("member_user_id", user_id)
            .eq("status", "active")
            .maybe_single()
            .execute()
        )
        if result.data:
            return result.data["role"]
        return "admin"  # Own account = admin
    except Exception:
        return "admin"


def require_role(required_role: str):
    """Dependency factory for role-based access control."""
    async def _check_role(current_user: CurrentUser = Depends(get_current_user)):
        if not current_user.has_role(required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires '{required_role}' role or higher",
            )
        return current_user
    return _check_role


require_admin = require_role("admin")
require_editor = require_role("editor")
require_viewer = require_role("viewer")
