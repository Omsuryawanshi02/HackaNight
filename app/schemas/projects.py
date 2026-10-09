"""Pydantic schemas for projects and membership."""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    code: str = Field(min_length=1, max_length=50)
    site_lat: float | None = None
    site_lon: float | None = None
    geofence_radius_m: float = Field(default=500.0, gt=0)
    start_date: datetime
    end_date: datetime | None = None
    status: str = Field(default="ACTIVE")


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: str | None = Field(default=None, min_length=1, max_length=50)
    site_lat: float | None = None
    site_lon: float | None = None
    geofence_radius_m: float | None = Field(default=None, gt=0)
    start_date: datetime | None = None
    end_date: datetime | None = None
    status: str | None = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    site_lat: float | None
    site_lon: float | None
    geofence_radius_m: float
    start_date: datetime
    end_date: datetime | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectMemberAdd(BaseModel):
    user_id: uuid.UUID
    role_on_project: str = Field(min_length=1, max_length=50)


class ProjectMemberResponse(BaseModel):
    project_id: uuid.UUID
    user_id: uuid.UUID
    role_on_project: str

    model_config = ConfigDict(from_attributes=True)
