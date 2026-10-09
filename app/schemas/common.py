"""Shared API response schemas: error envelope, pagination."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ErrorDetail(BaseModel):
    loc: list[str] | None = None
    msg: str
    type: str


class ErrorEnvelope(BaseModel):
    error: str
    message: str
    details: list[ErrorDetail] | None = None


class PaginatedResponse(BaseModel):
    """Generic cursor/limit-offset pagination envelope."""

    items: list[Any]
    total: int
    limit: int
    offset: int
    has_more: bool
