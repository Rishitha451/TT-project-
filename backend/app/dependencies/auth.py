"""
Authentication and Current User dependency providers.
"""

from typing import Optional
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedException
from app.core.security import decode_access_token
from app.dependencies.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository


async def get_current_user_token(authorization: Optional[str] = Header(None)) -> str:
    """Extract and validate Bearer token from Authorization header."""
    if not authorization:
        raise UnauthorizedException(
            message="Authorization token is required.",
            code="AUTHENTICATION_REQUIRED",
        )
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException(
            message="Invalid authorization scheme. Use 'Bearer <token>'.",
            code="INVALID_TOKEN",
        )
    token = authorization.split("Bearer ", 1)[1].strip()
    if not token:
        raise UnauthorizedException(
            message="Bearer token string cannot be empty.",
            code="INVALID_TOKEN",
        )
    return token


async def get_current_user(
    token: str = Depends(get_current_user_token),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Authenticate the request and return the active User entity.
    Validates JWT signature, expiration, user existence, and active status.
    """
    payload = decode_access_token(token)
    user_id = payload.get("sub")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)

    if not user:
        raise UnauthorizedException(
            message="User associated with token not found.",
            code="INVALID_TOKEN",
        )

    if not user.is_active:
        raise UnauthorizedException(
            message="User account is inactive or disabled.",
            code="USER_INACTIVE",
        )

    return user
