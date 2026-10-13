"""
Security, password hashing (Argon2), and JWT token services.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.core.config import settings
from app.core.exceptions import UnauthorizedException

# Recommended Argon2 password hasher
password_hash_context = PasswordHash((Argon2Hasher(),))


def hash_password(password: str) -> str:
    """Hash plaintext password with Argon2."""
    return password_hash_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against stored Argon2 hash."""
    return password_hash_context.verify(plain_password, hashed_password)


def create_access_token(
    user_id: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Generate signed JWT access token containing minimal required claims:
    - sub (subject / user id)
    - exp (expiration timestamp)
    - iat (issued-at timestamp)
    - type ("access")
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "exp": expire,
        "iat": now,
        "type": "access",
    }

    encoded_jwt = jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises standardized UnauthorizedException if expired, invalid, or malformed.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException(
            message="Authentication token has expired.",
            code="TOKEN_EXPIRED",
        )
    except jwt.InvalidTokenError:
        raise UnauthorizedException(
            message="Invalid authentication token.",
            code="INVALID_TOKEN",
        )

    # Validate token type
    if payload.get("type") != "access":
        raise UnauthorizedException(
            message="Invalid token type.",
            code="INVALID_TOKEN",
        )

    # Validate subject (user ID)
    if not payload.get("sub"):
        raise UnauthorizedException(
            message="Token payload missing subject identifier.",
            code="INVALID_TOKEN",
        )

    return payload
