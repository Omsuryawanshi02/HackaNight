"""Password hashing and JWT token utilities."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt

from app.core.config import get_settings

settings = get_settings()

# bcrypt only consumes the first 72 bytes of a password (its internal
# block size). bcrypt >= 4.1 raises ValueError on longer input instead
# of silently truncating, so we truncate explicitly. This keeps behaviour
# deterministic and remains compatible with hashes produced by older
# passlib/bcrypt versions (which truncated the raw password the same way).
_BCRYPT_MAX_PASSWORD_BYTES = 72


def _prepare(password: str) -> bytes:
    """Encode a password for bcrypt, applying the 72-byte limit."""
    return password.encode("utf-8")[:_BCRYPT_MAX_PASSWORD_BYTES]


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(_prepare(plain), hashed.encode("utf-8"))
    except ValueError:
        # Malformed hash or invalid bcrypt input: never authenticate.
        return False


def get_password_hash(password: str) -> str:
    """Hash a plaintext password with bcrypt."""
    return bcrypt.hashpw(_prepare(password), bcrypt.gensalt()).decode("utf-8")


def encode_jwt(
    data: dict,
    expires_delta: Optional[timedelta] = None,
    secret_key: str = settings.secret_key,
    algorithm: str = settings.algorithm,
) -> str:
    """Encode a JWT with the given claims and expiry."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire, "iat": now, "sub": data.get("sub")})
    return jwt.encode(to_encode, secret_key, algorithm=algorithm)


def decode_jwt(
    token: str,
    secret_key: str = settings.secret_key,
    algorithm: str = settings.algorithm,
) -> dict:
    """Decode and verify a JWT, returning its claims."""
    return jwt.decode(token, secret_key, algorithms=[algorithm])


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived access token for a user id."""
    return encode_jwt({"sub": subject}, expires_delta=expires_delta)


def create_refresh_token(subject: str) -> str:
    """Create a long-lived refresh token for a user id."""
    return encode_jwt(
        {"sub": subject},
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
    )
