"""Tasks (work packages), stages, and task-BOQ norms router.

Mounted under ``/projects/{project_id}/tasks``.

Authorization:
- Read: project members (and ADMIN).
- Create / update / delete: ADMIN only.
"""
from __future__ import annotations

import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import (
    get_current_user,
    require_permission,
    require_project_membership,
)
from app.db.models import Stage, Task, TaskBoQNorm
from app.db.session import get_db_session
from app.schemas.common import PaginatedResponse
from app.schemas.tasks import (
    StageCreate,
    StageResponse,
    StageUpdate,
    TaskBoQNormCreate,
    TaskBoQNormResponse,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)

router = APIRouter()


def _count_stmt(stmt):
    from sqlalchemy import func

    return select(func.count()).select_from(stmt.subquery())


# ── Tasks ─────────────────────────────────────────


@router.get("", response_model=PaginatedResponse)
async def list_tasks(
    project_id: uuid.UUID,
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    _membership=Depends(require_project_membership),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PaginatedResponse:
    """List tasks for a project (requires membership)."""
    stmt = (
        select(Task)
        .where(Task.project_id == project_id)
        .order_by(Task.created_at.desc())
    )
    total = (
        (await db.execute(_count_stmt(stmt))).scalar_one_or_none() or 0
    )
    result = await db.execute(stmt.limit(limit).offset(offset))
    tasks = result.scalars().all()
    return PaginatedResponse(
        items=[TaskResponse.model_validate(t).model_dump() for t in tasks],
        total=total,
        limit=limit,
        offset=offset,
        has_more=(offset + limit) < total,
    )


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: uuid.UUID,
    body: TaskCreate,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("task", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> TaskResponse:
    """Create a task / work package (ADMIN only)."""
    task = Task(project_id=project_id, **body.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> TaskResponse:
    """Fetch a single task (requires membership)."""
    task = await _get_task(db, project_id, task_id)
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    body: TaskUpdate,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("task", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> TaskResponse:
    """Update a task (ADMIN only)."""
    task = await _get_task(db, project_id, task_id)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    await db.commit()
    await db.refresh(task)
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("task", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete a task (ADMIN only)."""
    task = await _get_task(db, project_id, task_id)
    await db.delete(task)
    await db.commit()


async def _get_task(
    db: AsyncSession, project_id: uuid.UUID, task_id: uuid.UUID
) -> Task:
    result = await db.execute(
        select(Task).where(
            Task.id == task_id, Task.project_id == project_id
        )
    )
    task = result.scalar_one_or_none()
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task


# ── Stages ────────────────────────────────────────


@router.get("/{task_id}/stages", response_model=list[StageResponse])
async def list_stages(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[StageResponse]:
    """List stages for a task (requires membership)."""
    await _get_task(db, project_id, task_id)
    result = await db.execute(
        select(Stage)
        .where(Stage.task_id == task_id)
        .order_by(Stage.sequence)
    )
    stages = result.scalars().all()
    return [StageResponse.model_validate(s) for s in stages]


@router.post(
    "/{task_id}/stages",
    response_model=StageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_stage(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    body: StageCreate,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("stage", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> StageResponse:
    """Create a stage for a task (ADMIN only)."""
    await _get_task(db, project_id, task_id)
    stage = Stage(task_id=task_id, **body.model_dump())
    db.add(stage)
    await db.commit()
    await db.refresh(stage)
    return StageResponse.model_validate(stage)


@router.patch("/{task_id}/stages/{stage_id}", response_model=StageResponse)
async def update_stage(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    stage_id: uuid.UUID,
    body: StageUpdate,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("stage", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> StageResponse:
    """Update a stage (ADMIN only)."""
    stage = await _get_stage(db, project_id, task_id, stage_id)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(stage, field, value)
    await db.commit()
    await db.refresh(stage)
    return StageResponse.model_validate(stage)


@router.delete(
    "/{task_id}/stages/{stage_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_stage(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    stage_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("stage", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete a stage (ADMIN only)."""
    stage = await _get_stage(db, project_id, task_id, stage_id)
    await db.delete(stage)
    await db.commit()


async def _get_stage(
    db: AsyncSession,
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    stage_id: uuid.UUID,
) -> Stage:
    result = await db.execute(
        select(Stage)
        .join(Task, Stage.task_id == Task.id)
        .where(
            Stage.id == stage_id,
            Stage.task_id == task_id,
            Task.project_id == project_id,
        )
    )
    stage = result.scalar_one_or_none()
    if stage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Stage not found"
        )
    return stage


# ── Task-BOQ norms ────────────────────────────────


@router.get("/{task_id}/norms", response_model=list[TaskBoQNormResponse])
async def list_norms(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[TaskBoQNormResponse]:
    """List BOQ norms for a task (requires membership)."""
    await _get_task(db, project_id, task_id)
    result = await db.execute(
        select(TaskBoQNorm).where(TaskBoQNorm.task_id == task_id)
    )
    norms = result.scalars().all()
    return [TaskBoQNormResponse.model_validate(n) for n in norms]


@router.post(
    "/{task_id}/norms",
    response_model=TaskBoQNormResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_norm(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    body: TaskBoQNormCreate,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("task", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> TaskBoQNormResponse:
    """Link a BOQ item to a task with a consumption norm (ADMIN only)."""
    await _get_task(db, project_id, task_id)

    # Ensure the BOQ item belongs to the same project.
    from app.db.models import BOQItem

    boq = await db.execute(
        select(BOQItem).where(
            BOQItem.id == body.boq_item_id,
            BOQItem.project_id == project_id,
        )
    )
    if boq.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="boq_item_id does not belong to this project",
        )

    # Unique (task_id, boq_item_id).
    existing = await db.execute(
        select(TaskBoQNorm).where(
            TaskBoQNorm.task_id == task_id,
            TaskBoQNorm.boq_item_id == body.boq_item_id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Norm already exists for this task + BOQ item",
        )

    norm = TaskBoQNorm(task_id=task_id, **body.model_dump())
    db.add(norm)
    await db.commit()
    await db.refresh(norm)
    return TaskBoQNormResponse.model_validate(norm)


@router.delete(
    "/{task_id}/norms/{norm_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_norm(
    project_id: uuid.UUID,
    task_id: uuid.UUID,
    norm_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("task", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete a task-BOQ norm (ADMIN only)."""
    result = await db.execute(
        select(TaskBoQNorm).where(
            TaskBoQNorm.id == norm_id,
            TaskBoQNorm.task_id == task_id,
        )
    )
    norm = result.scalar_one_or_none()
    if norm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Norm not found"
        )
    await db.delete(norm)
    await db.commit()
