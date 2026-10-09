"""Authentication router: Supabase Auth integration (login, signup, refresh, logout, profile)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import get_current_user
from app.core.supabase import (
    refresh_supabase_token,
    sign_in_with_supabase,
    sign_out_supabase,
    sign_up_with_supabase,
    sync_supabase_user,
)
from app.db.models import User
from app.db.session import get_db_session
from app.schemas.auth import (
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    SignUpRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    body: SignUpRequest,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """Register a new user via Supabase Auth and synchronize their local account."""
    auth_result = await sign_up_with_supabase(
        email=body.email,
        password=body.password,
        full_name=body.full_name,
        role=body.role,
    )
    supabase_user = auth_result.get("user") or auth_result
    user = await sync_supabase_user(db, supabase_user)

    session = auth_result.get("session") or {}
    access_token = session.get("access_token") or auth_result.get("access_token") or ""
    refresh_token = session.get("refresh_token") or auth_result.get("refresh_token")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """Authenticate with email + password via Supabase Auth."""
    auth_result = await sign_in_with_supabase(body.email, body.password)
    supabase_user = auth_result.get("user") or {}
    user = await sync_supabase_user(db, supabase_user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    return TokenResponse(
        access_token=auth_result["access_token"],
        refresh_token=auth_result.get("refresh_token"),
        token_type=auth_result.get("token_type", "bearer"),
        user=UserResponse.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db_session),
) -> TokenResponse:
    """Exchange a valid Supabase refresh token for a fresh access token."""
    auth_result = await refresh_supabase_token(body.refresh_token)
    supabase_user = auth_result.get("user") or {}
    user = await sync_supabase_user(db, supabase_user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    return TokenResponse(
        access_token=auth_result["access_token"],
        refresh_token=auth_result.get("refresh_token"),
        token_type=auth_result.get("token_type", "bearer"),
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the profile of the currently authenticated Supabase user."""
    return UserResponse.model_validate(current_user)


@router.post("/logout", response_model=MessageResponse)
async def logout(
    authorization: str | None = Header(default=None),
) -> MessageResponse:
    """Sign out the current user session from Supabase Auth."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        await sign_out_supabase(token)
    return MessageResponse(message="Logged out successfully")
