"""Supabase Authentication service and token verification utilities.

Provides:
- Token verification against Supabase Auth (via local JWT decode or Supabase API)
- User login, signup, refresh, and logout via Supabase GoTrue REST API
- Automatic user synchronization between Supabase and the local database
- Development/testing fallback when Supabase credentials are not yet configured
"""
from __future__ import annotations

import logging
import uuid
from typing import Any

import httpx
import jwt
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models import User

logger = logging.getLogger("siteaudit.supabase")


def get_supabase_url() -> str:
    """Get the sanitized Supabase project URL (without trailing slash)."""
    settings = get_settings()
    return settings.supabase_url.rstrip("/") if settings.supabase_url else ""


def get_supabase_headers(use_service_role: bool = False, bearer_token: str | None = None) -> dict[str, str]:
    """Build headers for Supabase Auth REST requests."""
    settings = get_settings()
    api_key = (
        settings.supabase_service_role_key
        if use_service_role and settings.supabase_service_role_key
        else settings.supabase_anon_key
    )
    headers = {
        "apikey": api_key,
        "Content-Type": "application/json",
    }
    if bearer_token:
        headers["Authorization"] = f"Bearer {bearer_token}"
    elif use_service_role and settings.supabase_service_role_key:
        headers["Authorization"] = f"Bearer {settings.supabase_service_role_key}"
    return headers


async def verify_supabase_token(token: str) -> dict[str, Any]:
    """Verify an access token issued by Supabase Auth and return user claims.

    Verification sequence:
    1. If SUPABASE_JWT_SECRET is configured, attempt local HS256 JWT decode.
    2. If SUPABASE_URL is configured, call Supabase's GET /auth/v1/user endpoint.
    3. If neither is configured (dev/mock mode), verify against local SECRET_KEY.
    """
    settings = get_settings()

    # 1. Fast local verification using SUPABASE_JWT_SECRET if available
    if settings.supabase_jwt_secret:
        try:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            sub = payload.get("sub") or payload.get("id")
            if sub:
                user_meta = payload.get("user_metadata") or {}
                app_meta = payload.get("app_metadata") or {}
                role = user_meta.get("role") or app_meta.get("role") or payload.get("role") or "SITE_SUPERVISOR"
                return {
                    "id": str(sub),
                    "email": payload.get("email", ""),
                    "user_metadata": user_meta,
                    "app_metadata": app_meta,
                    "role": role,
                    "full_name": user_meta.get("full_name"),
                }
        except jwt.PyJWTError as e:
            logger.debug("Local Supabase JWT secret verification failed: %s; falling back to API", e)

    # 2. Remote verification via Supabase GET /auth/v1/user
    supabase_url = get_supabase_url()
    if supabase_url and (settings.supabase_anon_key or settings.supabase_service_role_key):
        url = f"{supabase_url}/auth/v1/user"
        headers = get_supabase_headers(bearer_token=token)
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                sub = data.get("id")
                if not sub:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Supabase user payload missing ID",
                    )
                user_meta = data.get("user_metadata") or {}
                app_meta = data.get("app_metadata") or {}
                role = user_meta.get("role") or app_meta.get("role") or "SITE_SUPERVISOR"
                return {
                    "id": str(sub),
                    "email": data.get("email", ""),
                    "user_metadata": user_meta,
                    "app_metadata": app_meta,
                    "role": role,
                    "full_name": user_meta.get("full_name"),
                }
            if response.status_code in (401, 403):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Supabase token",
                )
        except httpx.RequestError as exc:
            logger.error("Failed to connect to Supabase Auth API: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase Auth service is currently unreachable",
            )

    # 3. Development / Mock fallback when Supabase is not configured
    if not supabase_url:
        try:
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm],
                options={"verify_aud": False},
            )
            sub = payload.get("sub") or payload.get("id")
            if not sub:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token missing subject identifier",
                )
            user_meta = payload.get("user_metadata") or {}
            role = user_meta.get("role") or payload.get("role") or "SITE_SUPERVISOR"
            return {
                "id": str(sub),
                "email": payload.get("email", ""),
                "user_metadata": user_meta,
                "app_metadata": payload.get("app_metadata") or {},
                "role": role,
                "full_name": user_meta.get("full_name"),
            }
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to verify token with Supabase Auth",
    )


async def sign_in_with_supabase(email: str, password: str) -> dict[str, Any]:
    """Authenticate a user with Supabase Auth using email and password."""
    settings = get_settings()
    supabase_url = get_supabase_url()

    if supabase_url and (settings.supabase_anon_key or settings.supabase_service_role_key):
        url = f"{supabase_url}/auth/v1/token?grant_type=password"
        headers = get_supabase_headers()
        body = {"email": email, "password": password}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=body)
        except httpx.RequestError as exc:
            logger.error("Network error during Supabase login: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase Auth service is unreachable",
            )

        if response.status_code != 200:
            err_data = response.json() if "application/json" in response.headers.get("content-type", "") else {}
            msg = err_data.get("error_description") or err_data.get("msg") or "Invalid email or password"
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=msg,
            )
        return response.json()

    # Development / Mock fallback when Supabase is unconfigured:
    # Generates a deterministic mock session token for testing
    from datetime import datetime, timedelta, timezone
    from app.core.security import encode_jwt

    # Create mock session
    now = datetime.now(timezone.utc)
    mock_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, email))
    if "admin" in email.lower():
        role = "ADMIN"
    elif "auditor" in email.lower():
        role = "PROJECT_AUDITOR"
    elif "store" in email.lower():
        role = "STORE_INCHARGE"
    else:
        role = "SITE_SUPERVISOR"

    access_token = encode_jwt({"sub": mock_id, "email": email, "role": role})
    refresh_token = encode_jwt(
        {"sub": mock_id, "email": email},
        expires_delta=timedelta(days=30),
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": mock_id,
            "email": email,
            "user_metadata": {"role": role},
        },
    }


async def sign_up_with_supabase(
    email: str,
    password: str,
    full_name: str | None = None,
    role: str = "SITE_SUPERVISOR",
) -> dict[str, Any]:
    """Register a new user in Supabase Auth."""
    settings = get_settings()
    supabase_url = get_supabase_url()

    if supabase_url and (settings.supabase_anon_key or settings.supabase_service_role_key):
        url = f"{supabase_url}/auth/v1/signup"
        headers = get_supabase_headers()
        body = {
            "email": email,
            "password": password,
            "data": {
                "full_name": full_name,
                "role": role,
            },
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=body)
        except httpx.RequestError as exc:
            logger.error("Network error during Supabase signup: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase Auth service is unreachable",
            )

        if response.status_code not in (200, 201):
            err_data = response.json() if "application/json" in response.headers.get("content-type", "") else {}
            msg = err_data.get("error_description") or err_data.get("msg") or "Failed to sign up with Supabase"
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=msg,
            )
        data = response.json()
        return data

    # Dev/Mock fallback
    from app.core.security import encode_jwt

    mock_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, email))
    access_token = encode_jwt({"sub": mock_id, "email": email, "role": role})
    return {
        "access_token": access_token,
        "refresh_token": "mock-refresh-token",
        "token_type": "bearer",
        "user": {
            "id": mock_id,
            "email": email,
            "user_metadata": {"full_name": full_name, "role": role},
        },
    }


async def refresh_supabase_token(refresh_token: str) -> dict[str, Any]:
    """Exchange a Supabase refresh token for a new access token."""
    settings = get_settings()
    supabase_url = get_supabase_url()

    if supabase_url and (settings.supabase_anon_key or settings.supabase_service_role_key):
        url = f"{supabase_url}/auth/v1/token?grant_type=refresh_token"
        headers = get_supabase_headers()
        body = {"refresh_token": refresh_token}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=body)
        except httpx.RequestError as exc:
            logger.error("Network error during Supabase token refresh: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Supabase Auth service is unreachable",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )
        return response.json()

    # Dev/Mock fallback
    from app.core.security import decode_jwt, encode_jwt

    try:
        payload = decode_jwt(refresh_token)
        sub = payload.get("sub") or str(uuid.uuid4())
        email = payload.get("email", "dev@siteaudit.io")
        access_token = encode_jwt({"sub": sub, "email": email, "role": "SITE_SUPERVISOR"})
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": sub,
                "email": email,
                "user_metadata": {"role": "SITE_SUPERVISOR"},
            },
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )


async def sign_out_supabase(token: str) -> None:
    """Revoke user session in Supabase Auth."""
    supabase_url = get_supabase_url()
    if supabase_url:
        url = f"{supabase_url}/auth/v1/logout"
        headers = get_supabase_headers(bearer_token=token)
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                await client.post(url, headers=headers)
        except Exception as exc:
            logger.warning("Error calling Supabase logout: %s", exc)


async def sync_supabase_user(db: AsyncSession, supabase_user: dict[str, Any]) -> User:
    """Ensure a user record exists in the local database matching the Supabase user.

    If the user does not exist in the database, automatically provision a new User
    row using their Supabase ID, email, and metadata (full_name, role).
    """
    raw_id = supabase_user.get("id") or supabase_user.get("sub")
    if not raw_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User data is missing a valid identifier",
        )

    try:
        user_uuid = uuid.UUID(str(raw_id))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed user UUID from Supabase",
        )

    email = supabase_user.get("email") or ""
    metadata = supabase_user.get("user_metadata") or {}
    full_name = metadata.get("full_name") or supabase_user.get("full_name")
    role = metadata.get("role") or supabase_user.get("role") or "SITE_SUPERVISOR"

    # 1. Lookup by Supabase ID
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()

    if user is not None:
        # Update details if metadata changed
        changed = False
        if full_name and user.full_name != full_name:
            user.full_name = full_name
            changed = True
        if role and user.role != role:
            user.role = role
            changed = True
        if changed:
            await db.commit()
            await db.refresh(user)
        return user

    # 2. Lookup by email if ID hasn't matched yet (handles pre-seeded local users)
    if email:
        result_by_email = await db.execute(select(User).where(User.email == email))
        user_by_email = result_by_email.scalar_one_or_none()
        if user_by_email is not None:
            return user_by_email

    # 3. Provision new user
    user = User(
        id=user_uuid,
        email=email,
        full_name=full_name,
        role=role,
        is_active=True,
        password_hash=None,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    logger.info("Provisioned local User record for Supabase user: %s (%s)", user.id, user.email)
    return user
