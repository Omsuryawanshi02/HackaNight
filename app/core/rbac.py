"""Role-based access control.

Roles and their capabilities (enforced at the dependency layer,
never only in the UI):

- SITE_SUPERVISOR: submit progress claims with photos for tasks on
  assigned projects; view own claims and their verification results.
- STORE_INCHARGE: upload delivery challans; record material issues
  (drawdowns); view stock ledger.
- PROJECT_AUDITOR: read everything on assigned projects; review and
  override flags (with mandatory reason); resolve alerts; request and
  issue milestone certificates.
- ADMIN: manage users, projects, BOQ, geofences, thresholds.
"""
from __future__ import annotations

import uuid
from enum import Enum

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_jwt
from app.db.models import ProjectMember, User
from app.db.session import get_db_session


class Role(str, Enum):
    SITE_SUPERVISOR = "SITE_SUPERVISOR"
    STORE_INCHARGE = "STORE_INCHARGE"
    PROJECT_AUDITOR = "PROJECT_AUDITOR"
    ADMIN = "ADMIN"


# What each role may do, keyed by (resource, action). Actions are
# coarse-grained: "read", "write", "admin".
PERMISSIONS: dict[Role, set[tuple[str, str]]] = {
    Role.SITE_SUPERVISOR: {
        ("claim", "write"),
        ("claim", "read"),
        ("project", "read"),
        ("task", "read"),
        ("stage", "read"),
    },
    Role.STORE_INCHARGE: {
        ("challan", "write"),
        ("challan", "read"),
        ("issue", "write"),
        ("stock", "read"),
        ("project", "read"),
        ("boq", "read"),
    },
    Role.PROJECT_AUDITOR: {
        ("claim", "read"),
        ("claim", "override"),
        ("challan", "read"),
        ("alert", "read"),
        ("alert", "resolve"),
        ("anomaly", "read"),
        ("milestone", "read"),
        ("milestone", "certify"),
        ("audit_log", "read"),
        ("project", "read"),
        ("task", "read"),
        ("stock", "read"),
    },
    Role.ADMIN: {
        ("user", "admin"),
        ("project", "admin"),
        ("project", "read"),
        ("project", "write"),
        ("boq", "admin"),
        ("task", "admin"),
        ("stage", "admin"),
        ("milestone", "admin"),
        ("threshold", "admin"),
        ("geofence", "admin"),
        ("claim", "read"),
        ("challan", "read"),
        ("alert", "read"),
        ("alert", "resolve"),
        ("audit_log", "read"),
        ("stock", "read"),
    },
}


def role_has_permission(role: Role, resource: str, action: str) -> bool:
    """Return True if the role permits the (resource, action)."""
    return (resource, action) in PERMISSIONS.get(role, set())


def require_permission(resource: str, action: str):
    """Dependency factory: require the current user to hold a permission."""

    async def _check(
        current_user: User = Depends(get_current_user),
    ) -> User:
        role = Role(current_user.role)
        if not role_has_permission(role, resource, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role {role.value} may not {action} {resource}",
            )
        return current_user

    return _check


async def get_current_user(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db_session),
) -> User:
    """Resolve the current user from the Authorization: Bearer <token> header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header",
        )
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_jwt(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
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
    return user


async def require_project_membership(
    project_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ProjectMember:
    """Ensure the user is a member of the given project.

    ADMIN bypasses the membership check (full access).
    """
    if user.role == Role.ADMIN.value:
        # Return a synthetic membership for admins.
        return ProjectMember(
            project_id=project_id, user_id=user.id, role_on_project="ADMIN"
        )

    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    )
    membership = result.scalar_one_or_none()
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this project",
        )
    return membership
