"""Pydantic schemas for tasks (work packages), stages, and BOQ norms."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# ── Tasks (work packages) ──────────────────────────────


class TaskCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    boq_link: uuid.UUID | None = None
    planned_start: datetime | None = None
    planned_end: datetime | None = None
    weight_pct: float = Field(default=1.0, gt=0)


class TaskUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    boq_link: uuid.UUID | None = None
    planned_start: datetime | None = None
    planned_end: datetime | None = None
    weight_pct: float | None = Field(default=None, gt=0)


class TaskResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    boq_link: uuid.UUID | None
    planned_start: datetime | None
    planned_end: datetime | None
    weight_pct: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Stages ─────────────────────────────────────────────


class StageCreate(BaseModel):
    sequence: int = Field(ge=0)
    name: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    expected_visual_cues: list[str] = Field(default_factory=list)
    required_photo_count: int = Field(default=3, ge=1)


class StageUpdate(BaseModel):
    sequence: int | None = Field(default=None, ge=0)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    expected_visual_cues: list[str] | None = None
    required_photo_count: int | None = Field(default=None, ge=1)


class StageResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    sequence: int
    name: str
    description: str
    expected_visual_cues: list
    required_photo_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ── Task-BOQ norms ─────────────────────────────────────


class TaskBoQNormCreate(BaseModel):
    task_id: uuid.UUID
    boq_item_id: uuid.UUID
    norm_qty_per_unit_work: float = Field(gt=0)


class TaskBoQNormResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    boq_item_id: uuid.UUID
    norm_qty_per_unit_work: float

    model_config = ConfigDict(from_attributes=True)
