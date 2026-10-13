"""
Authentication API endpoints: registration, login, logout, and current user profile.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import create_access_token, hash_password, verify_password
from app.dependencies.auth import get_current_user
from app.dependencies.database import get_db
from app.models.settings import UserSettings
from app.models.user import User
from app.repositories.settings_repository import SettingsRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.common import ApiResponse
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=ApiResponse[UserRead],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
@router.post(
    "/signup",
    response_model=ApiResponse[UserRead],
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[UserRead]:
    """
    Register a new user with Argon2 password hashing and default settings.
    Atomic transaction ensures complete profile setup or total rollback.
    """
    normalized_email = payload.email.lower().strip()
    user_repo = UserRepository(db)

    # Pre-check for duplicate email
    existing_user = await user_repo.get_by_email(normalized_email)
    if existing_user:
        raise ConflictException(
            message="An account with this email address already exists.",
            code="EMAIL_ALREADY_REGISTERED",
        )

    # Hash password with Argon2
    hashed_pwd = hash_password(payload.password)

    new_user = User(
        email=normalized_email,
        name=payload.name.strip(),
        password_hash=hashed_pwd,
        currency=payload.currency or "INR",
        is_active=True,
    )

    try:
        db.add(new_user)
        await db.flush()

        # Create default UserSettings atomically
        default_settings = UserSettings(
            user_id=new_user.id,
            currency=new_user.currency,
            theme="dark",
            email_alerts=True,
            push_notifications=True,
            weekly_digest=True,
            investment_alerts=True,
        )
        db.add(default_settings)

        await db.commit()
        await db.refresh(new_user)
    except IntegrityError:
        await db.rollback()
        raise ConflictException(
            message="An account with this email address already exists.",
            code="EMAIL_ALREADY_REGISTERED",
        )
    except Exception:
        await db.rollback()
        raise

    return ApiResponse(
        success=True,
        data=UserRead.model_validate(new_user),
    )


@router.post(
    "/login",
    response_model=ApiResponse[TokenResponse],
    summary="Authenticate user and return JWT access token",
)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    """
    Authenticate user via email & password and return signed JWT bearer token.
    Uses constant-time verification & uniform error message to prevent user enumeration.
    """
    normalized_email = payload.email.lower().strip()
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(normalized_email)

    if not user:
        # Generic authentication failure to prevent account harvesting
        raise UnauthorizedException(
            message="Invalid email or password.",
            code="INVALID_CREDENTIALS",
        )

    if not verify_password(payload.password, user.password_hash):
        raise UnauthorizedException(
            message="Invalid email or password.",
            code="INVALID_CREDENTIALS",
        )

    if not user.is_active:
        raise UnauthorizedException(
            message="User account is inactive or disabled.",
            code="USER_INACTIVE",
        )

    # Generate signed JWT
    access_token = create_access_token(user.id)
    expires_in_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return ApiResponse(
        success=True,
        data=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=expires_in_seconds,
            user=UserRead.model_validate(user),
        ),
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserRead],
    summary="Get current authenticated user profile",
)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> ApiResponse[UserRead]:
    """
    Return sanitized profile of the currently authenticated user.
    """
    return ApiResponse(
        success=True,
        data=UserRead.model_validate(current_user),
    )


@router.post(
    "/logout",
    response_model=ApiResponse[dict],
    summary="Logout user session",
)
async def logout() -> ApiResponse[dict]:
    """
    Stateless JWT logout acknowledgment.
    """
    return ApiResponse(
        success=True,
        data={"message": "Logged out successfully."},
    )
