"""BOQ router: CRUD and atomic CSV import.

Authorization:
- Read BOQ: project members (and ADMIN).
- Create / update / delete / import: ADMIN only.

The CSV import is atomic: if any row fails validation
(including duplicates against existing DB rows), the
whole upload is rejected and nothing is written.
"""
from __future__ import annotations

import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    UploadFile,
    File,
    status,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import (
    get_current_user,
    require_permission,
    require_project_membership,
)
from app.db.models import BOQItem
from app.db.session import get_db_session
from app.schemas.boq import (
    BOQImportReport,
    BOQImportRowError,
    BOQItemCreate,
    BOQItemResponse,
    BOQItemUpdate,
)
from app.schemas.common import PaginatedResponse
from app.services.boq.csv_import import parse_boq_csv

router = APIRouter()


@router.get("", response_model=PaginatedResponse)
async def list_boq_items(
    project_id: uuid.UUID,
    limit: int = Query(default=100, le=500),
    offset: int = Query(default=0, ge=0),
    _membership=Depends(require_project_membership),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PaginatedResponse:
    """List BOQ items for a project (requires membership)."""
    stmt = (
        select(BOQItem)
        .where(BOQItem.project_id == project_id)
        .order_by(BOQItem.item_code)
    )
    count = await db.execute(
        select(func_count()).select_from(stmt.subquery())
    )
    total = count.scalar_one_or_none() or 0

    result = await db.execute(stmt.limit(limit).offset(offset))
    items = result.scalars().all()

    return PaginatedResponse(
        items=[BOQItemResponse.model_validate(i).model_dump() for i in items],
        total=total,
        limit=limit,
        offset=offset,
        has_more=(offset + limit) < total,
    )


@router.post("", response_model=BOQItemResponse, status_code=status.HTTP_201_CREATED)
async def create_boq_item(
    project_id: uuid.UUID,
    body: BOQItemCreate,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("boq", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> BOQItemResponse:
    """Create a single BOQ item (ADMIN only)."""
    # Unique (project_id, item_code).
    existing = await db.execute(
        select(BOQItem).where(
            BOQItem.project_id == project_id,
            BOQItem.item_code == body.item_code,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"BOQ item '{body.item_code}' already exists in this project",
        )

    item = BOQItem(project_id=project_id, **body.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return BOQItemResponse.model_validate(item)


@router.get("/{item_id}", response_model=BOQItemResponse)
async def get_boq_item(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> BOQItemResponse:
    """Fetch a single BOQ item (requires membership)."""
    result = await db.execute(
        select(BOQItem).where(
            BOQItem.id == item_id, BOQItem.project_id == project_id
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="BOQ item not found"
        )
    return BOQItemResponse.model_validate(item)


@router.patch("/{item_id}", response_model=BOQItemResponse)
async def update_boq_item(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    body: BOQItemUpdate,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("boq", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> BOQItemResponse:
    """Update a BOQ item (ADMIN only)."""
    result = await db.execute(
        select(BOQItem).where(
            BOQItem.id == item_id, BOQItem.project_id == project_id
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="BOQ item not found"
        )

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return BOQItemResponse.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_boq_item(
    project_id: uuid.UUID,
    item_id: uuid.UUID,
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("boq", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete a BOQ item (ADMIN only)."""
    result = await db.execute(
        select(BOQItem).where(
            BOQItem.id == item_id, BOQItem.project_id == project_id
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="BOQ item not found"
        )
    await db.delete(item)
    await db.commit()


@router.post(
    "/import", response_model=BOQImportReport, status_code=status.HTTP_200_OK
)
async def import_boq_csv(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    _membership=Depends(require_project_membership),
    current_user=Depends(require_permission("boq", "admin")),
    db: AsyncSession = Depends(get_db_session),
) -> BOQImportReport:
    """Import a BOQ CSV (ADMIN only).

    The import is atomic: if any row is invalid (or
    duplicates an existing item_code in the project), the
    entire upload is rejected and nothing is written.
    """
    if not (file.filename or "").lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .csv files are accepted",
        )

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File is not valid UTF-8: {exc}",
        ) from exc

    parsed = parse_boq_csv(text)

    # Collect parse/validation errors.
    errors: list[BOQImportRowError] = [
        BOQImportRowError(row=e.row, column=e.column, message=e.message)
        for e in parsed.errors
    ]

    # Check for duplicates against existing DB rows (only when the
    # CSV itself parsed cleanly enough to have candidate rows).
    if parsed.rows:
        existing_codes = await _existing_item_codes(db, project_id)
        seen: set[str] = set()
        for draft in parsed.rows:
            if draft.item_code in existing_codes:
                errors.append(
                    BOQImportRowError(
                        row=_row_of(parsed, draft),
                        column="item_code",
                        message=f"item_code '{draft.item_code}' already exists in project",
                    )
                )
            elif draft.item_code in seen:
                errors.append(
                    BOQImportRowError(
                        row=_row_of(parsed, draft),
                        column="item_code",
                        message=f"duplicate item_code '{draft.item_code}' in file",
                    )
                )
            else:
                seen.add(draft.item_code)

    # Atomicity: any error => import nothing.
    if errors:
        return BOQImportReport(
            imported=0,
            total_rows=len(parsed.rows) + len(errors),
            errors=errors,
            status="REJECTED",
        )

    # All clear: insert every row in a single transaction.
    for draft in parsed.rows:
        db.add(
            BOQItem(
                project_id=project_id,
                item_code=draft.item_code,
                description=draft.description,
                unit=draft.unit,
                planned_qty=draft.planned_qty,
                tolerance_pct=draft.tolerance_pct,
                rate=draft.rate,
                category=draft.category,
            )
        )
    await db.commit()

    return BOQImportReport(
        imported=len(parsed.rows),
        total_rows=len(parsed.rows),
        errors=[],
        status="OK",
    )


async def _existing_item_codes(
    db: AsyncSession, project_id: uuid.UUID
) -> set[str]:
    """Return the set of item_codes already present for the project."""
    result = await db.execute(
        select(BOQItem.item_code).where(BOQItem.project_id == project_id)
    )
    return {row for row in result.scalars().all()}


def _row_of(parsed, draft) -> int:
    """Best-effort 1-based row number for a draft (index + 1)."""
    try:
        return parsed.rows.index(draft) + 1
    except ValueError:
        return 0


def func_count():
    from sqlalchemy import func

    return func.count()
