"""Authentication router: login, refresh, and current-user profile."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_jwt,
    verify_password,
)
from app.db.models import User
from app.db.session import get_db_session
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """Authenticate with email + password and issue JWT tokens."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """Exchange a valid refresh token for a fresh access token."""
    try:
        payload = decode_jwt(body.refresh_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    access = create_access_token(str(user.id))
    refresh = create_refresh_token(str(user.id))
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the profile of the currently authenticated user."""
    return UserResponse.model_validate(current_user)
