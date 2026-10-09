"""Pydantic schemas for BOQ items and CSV import."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BOQItemCreate(BaseModel):
    item_code: str = Field(min_length=1, max_length=50)
    description: str = Field(min_length=1, max_length=500)
    unit: str = Field(min_length=1, max_length=50)
    planned_qty: float = Field(gt=0)
    tolerance_pct: float = Field(default=10.0, ge=0)
    rate: float = Field(default=0.0, ge=0)
    category: str = Field(default="other")


class BOQItemUpdate(BaseModel):
    item_code: str | None = Field(default=None, min_length=1, max_length=50)
    description: str | None = Field(default=None, min_length=1, max_length=500)
    unit: str | None = Field(default=None, min_length=1, max_length=50)
    planned_qty: float | None = Field(default=None, gt=0)
    tolerance_pct: float | None = Field(default=None, ge=0)
    rate: float | None = Field(default=None, ge=0)
    category: str | None = Field(default=None)


class BOQItemResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    item_code: str
    description: str
    unit: str
    planned_qty: float
    tolerance_pct: float
    rate: float
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BOQImportRowError(BaseModel):
    row: int
    column: str
    message: str


class BOQImportReport(BaseModel):
    """Result of a BOQ CSV import attempt."""

    imported: int = 0
    total_rows: int = 0
    errors: list[BOQImportRowError] = []
    status: str = "OK"  # OK or REJECTED
