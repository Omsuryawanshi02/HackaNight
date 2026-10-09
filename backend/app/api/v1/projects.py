"""Projects router: project CRUD and membership management.

Authorization rules:
- Create / update / delete projects and manage members: ADMIN only.
- Read a project: ADMIN, or a member of that project.
- Project-scoped access is enforced on every object (IDOR protection).
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import (
    Role,
    get_current_user,
    require_permission,
    require_project_membership,
)
from app.db.models import Project, ProjectMember
from app.db.session import get_db_session
from app.schemas.projects import (
    ProjectCreate,
    ProjectMemberAdd,
    ProjectMemberResponse,
    ProjectResponse,
    ProjectUpdate,
)
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    current_user=Depends(require_permission("project", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> ProjectResponse:
    """Create a new project (ADMIN only)."""
    # Enforce unique project code.
    existing = await db.execute(select(Project).where(Project.code == body.code))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Project code '{body.code}' already exists",
        )

    project = Project(**body.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.get("/", response_model=PaginatedResponse)
async def list_projects(
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PaginatedResponse:
    """List projects the user can access.

    ADMIN sees all projects; other roles see only projects
    they are a member of.
    """
    if current_user.role == Role.ADMIN.value:
        stmt = select(Project).order_by(Project.created_at.desc())
    else:
        stmt = (
            select(Project)
            .join(ProjectMember, ProjectMember.project_id == Project.id)
            .where(ProjectMember.user_id == current_user.id)
            .order_by(Project.created_at.desc())
        )

    count_stmt = select(func_count(stmt))
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one_or_none() or 0

    result = await db.execute(stmt.limit(limit).offset(offset))
    projects = result.scalars().all()

    return PaginatedResponse(
        items=[ProjectResponse.model_validate(p).model_dump() for p in projects],
        total=total,
        limit=limit,
        offset=offset,
        has_more=(offset + limit) < total,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> ProjectResponse:
    """Fetch a single project (requires membership or ADMIN)."""
    # require_project_membership already validated access; but it needs
    # the project_id bound. We re-fetch to return the object.
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    return ProjectResponse.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("project", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> ProjectResponse:
    """Update a project (ADMIN only)."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return ProjectResponse.model_validate(project)


@router.post(
    "/{project_id}/members",
    response_model=ProjectMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_project_member(
    project_id: uuid.UUID,
    body: ProjectMemberAdd,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("project", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> ProjectMemberResponse:
    """Add a member to a project (ADMIN only)."""
    existing = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == body.user_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a member of this project",
        )

    member = ProjectMember(
        project_id=project_id,
        user_id=body.user_id,
        role_on_project=body.role_on_project,
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return ProjectMemberResponse.model_validate(member)


@router.get("/{project_id}/members", response_model=list[ProjectMemberResponse])
async def list_project_members(
    project_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[ProjectMemberResponse]:
    """List members of a project (requires membership or ADMIN)."""
    result = await db.execute(
        select(ProjectMember).where(ProjectMember.project_id == project_id)
    )
    members = result.scalars().all()
    return [ProjectMemberResponse.model_validate(m) for m in members]


def func_count(stmt):
    """Build a count query from a select statement."""
    from sqlalchemy import func

    # Replace columns with a count of rows.
    return select(func.count()).select_from(stmt.subquery())
