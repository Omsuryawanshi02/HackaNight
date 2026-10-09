"""SQLAlchemy models for the Site Audit Platform.

All tables use UUID primary keys, created_at/updated_at timestamps, and are
portable between SQLite (dev/tests) and PostgreSQL (production).

The ``audit_log`` and ``stock_ledger`` tables are append-only: the
application never issues UPDATE/DELETE against them.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ──────────────────────────────────────────────────────────────────────
# Core identity
# ──────────────────────────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="SITE_SUPERVISOR")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=_utcnow, onupdate=_utcnow
    )

    project_memberships: Mapped[list["ProjectMember"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    site_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    site_lon: Mapped[float | None] = mapped_column(Float, nullable=True)
    geofence_radius_m: Mapped[float] = mapped_column(Float, nullable=False, default=500.0)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="ACTIVE")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=_utcnow, onupdate=_utcnow
    )

    members: Mapped[list["ProjectMember"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    boq_items: Mapped[list["BOQItem"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    challans: Mapped[list["Challan"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    stock_ledger: Mapped[list["StockLedger"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    material_issues: Mapped[list["MaterialIssue"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["Alert"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    milestones: Mapped[list["Milestone"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class ProjectMember(Base):
    __tablename__ = "project_members"
    __table_args__ = (UniqueConstraint("project_id", "user_id", name="uq_pm_project_user"),)

    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_on_project: Mapped[str] = mapped_column(String(50), nullable=False)

    project: Mapped["Project"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="project_memberships")


class BOQItem(Base):
    __tablename__ = "boq_items"
    __table_args__ = (UniqueConstraint("project_id", "item_code", name="uq_boq_project_code"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    item_code: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    planned_qty: Mapped[float] = mapped_column(Float, nullable=False)
    tolerance_pct: Mapped[float] = mapped_column(Float, nullable=False, default=10.0)
    rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, default="other"
    )  # cement, steel, sand, aggregate, brick, tile, paint, other
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)

    project: Mapped["Project"] = relationship(back_populates="boq_items")
    task_norms: Mapped[list["TaskBoQNorm"]] = relationship(
        back_populates="boq_item", cascade="all, delete-orphan"
    )
    challan_lines: Mapped[list["ChallanLine"]] = relationship(
        back_populates="matched_boq_item"
    )
    stock_ledger: Mapped[list["StockLedger"]] = relationship(
        back_populates="boq_item", cascade="all, delete-orphan"
    )


# ──────────────────────────────────────────────────────────────────────
# Work packages / tasks / stages
# ──────────────────────────────────────────────────────────────────────


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    boq_link: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("boq_items.id"), nullable=True, index=True
    )
    planned_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    planned_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    weight_pct: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)

    project: Mapped["Project"] = relationship(back_populates="tasks")
    task_norms: Mapped[list["TaskBoQNorm"]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )
    stages: Mapped[list["Stage"]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )
    claims: Mapped[list["ProgressClaim"]] = relationship(
        back_populates="task", cascade="all, delete-orphan"
    )


class TaskBoQNorm(Base):
    __tablename__ = "task_boq_norms"
    __table_args__ = (UniqueConstraint("task_id", "boq_item_id", name="uq_norm_task_boq"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    boq_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("boq_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    norm_qty_per_unit_work: Mapped[float] = mapped_column(Float, nullable=False)

    task: Mapped["Task"] = relationship(back_populates="task_norms")
    boq_item: Mapped["BOQItem"] = relationship(back_populates="task_norms")


class Stage(Base):
    __tablename__ = "stages"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sequence: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    expected_visual_cues: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    required_photo_count: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)

    task: Mapped["Task"] = relationship(back_populates="stages")
    claims: Mapped[list["ProgressClaim"]] = relationship(
        back_populates="stage", cascade="all, delete-orphan"
    )


# ──────────────────────────────────────────────────────────────────────
# Progress claims / claim photos / VLM results
# ──────────────────────────────────────────────────────────────────────


class ProgressClaim(Base):
    __tablename__ = "progress_claims"
    __table_args__ = (
        Index("ix_claims_status", "status"),
        Index("ix_claims_task_id", "task_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    stage_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("stages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    submitted_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=False
    )
    claimed_pct_complete: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    claimed_qty: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="SUBMITTED")
    composite_score: Mapped[float | None] = mapped_column(Float, nullable=True, default=0.0)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)
    # Auditor override fields
    overridden_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    override_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    override_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    task: Mapped["Task"] = relationship(back_populates="claims")
    stage: Mapped["Stage"] = relationship(back_populates="claims")
    claim_photos: Mapped[list["ClaimPhoto"]] = relationship(
        back_populates="claim", cascade="all, delete-orphan"
    )


class VlmResult(Base):
    __tablename__ = "vlm_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    photo_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("claim_photos.id", ondelete="CASCADE"), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    prompt_version: Mapped[str] = mapped_column(String(50), nullable=False)
    stage_match: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    observed_elements: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    missing_elements: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    estimated_completion_pct: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    anomalies: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    raw_response: Mapped[dict] = mapped_column(JSON, nullable=True)
    latency_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)

    photo: Mapped["ClaimPhoto"] = relationship(back_populates="vlm_result")


class ClaimPhoto(Base):
    __tablename__ = "claim_photos"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    claim_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("progress_claims.id", ondelete="CASCADE"), nullable=False, index=True
    )
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False, unique=True, index=True)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    phash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    dhash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    exif_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    captured_at_exif: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    lat_exif: Mapped[float | None] = mapped_column(Float, nullable=True)
    lon_exif: Mapped[float | None] = mapped_column(Float, nullable=True)
    device_make: Mapped[str | None] = mapped_column(String(100), nullable=True)
    device_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    integrity_score: Mapped[float | None] = mapped_column(Float, nullable=True, default=0.0)
    integrity_flags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    # Back-reference to the VLM result for this photo. NOT a FK:
    # vlm_results.photo_id is the authoritative FK (avoids a circular
    # FK deadlock between claim_photos and vlm_results).
    vlm_result_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True, index=True)

    claim: Mapped["ProgressClaim"] = relationship(back_populates="claim_photos")
    vlm_result: Mapped["VlmResult | None"] = relationship(back_populates="photo")


# ──────────────────────────────────────────────────────────────────────
# Vendors / challans / challan lines
# ──────────────────────────────────────────────────────────────────────


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    gstin_tax_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)

    challans: Mapped[list["Challan"]] = relationship(back_populates="vendor")


class Challan(Base):
    __tablename__ = "challans"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vendor_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("vendors.id"), nullable=True, index=True
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=False
    )
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False, unique=True, index=True)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    challan_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    challan_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    vehicle_no: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="UPLOADED")
    ocr_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ocr_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)

    project: Mapped["Project"] = relationship(back_populates="challans")
    vendor: Mapped["Vendor | None"] = relationship(back_populates="challans")
    lines: Mapped[list["ChallanLine"]] = relationship(
        back_populates="challan", cascade="all, delete-orphan"
    )


class ChallanLine(Base):
    __tablename__ = "challan_lines"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    challan_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("challans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    raw_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    matched_boq_item_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("boq_items.id"), nullable=True, index=True
    )
    match_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    qty: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    normalized_qty: Mapped[float | None] = mapped_column(Float, nullable=True)
    rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    line_status: Mapped[str] = mapped_column(String(50), nullable=False, default="UNMATCHED")

    challan: Mapped["Challan"] = relationship(back_populates="lines")
    matched_boq_item: Mapped["BOQItem | None"] = relationship(back_populates="challan_lines")


# ──────────────────────────────────────────────────────────────────────
# Stock ledger (append-only) / material issues
# ──────────────────────────────────────────────────────────────────────


class StockLedger(Base):
    """Append-only ledger. The application never UPDATEs or DELETEs these rows."""

    __tablename__ = "stock_ledger"
    __table_args__ = (
        Index("ix_ledger_project_item", "project_id", "boq_item_id"),
        Index("ix_ledger_occurred_at", "occurred_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    boq_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("boq_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    entry_type: Mapped[str] = mapped_column(String(50), nullable=False)  # RECEIPT, ISSUE, ADJUSTMENT, RETURN
    qty: Mapped[float] = mapped_column(Float, nullable=False)
    ref_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ref_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    task_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tasks.id"), nullable=True, index=True
    )
    recorded_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=False
    )
    occurred_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    project: Mapped["Project"] = relationship(back_populates="stock_ledger")
    boq_item: Mapped["BOQItem"] = relationship(back_populates="stock_ledger")


class MaterialIssue(Base):
    __tablename__ = "material_issues"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    boq_item_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("boq_items.id", ondelete="CASCADE"), nullable=False, index=True
    )
    task_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tasks.id"), nullable=True, index=True
    )
    qty: Mapped[float] = mapped_column(Float, nullable=False)
    issued_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=False
    )
    issued_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)

    project: Mapped["Project"] = relationship(back_populates="material_issues")


# ──────────────────────────────────────────────────────────────────────
# Alerts
# ──────────────────────────────────────────────────────────────────────


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        Index("ix_alerts_project_status", "project_id", "status"),
        Index("ix_alerts_severity", "severity"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="WARN")
    subject_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    subject_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    evidence: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="OPEN")
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    resolution_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)

    project: Mapped["Project"] = relationship(back_populates="alerts")


# ──────────────────────────────────────────────────────────────────────
# Milestones / requirements / certificates
# ──────────────────────────────────────────────────────────────────────


class Milestone(Base):
    __tablename__ = "milestones"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    payment_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)

    project: Mapped["Project"] = relationship(back_populates="milestones")
    requirements: Mapped[list["MilestoneRequirement"]] = relationship(
        back_populates="milestone", cascade="all, delete-orphan"
    )
    certificates: Mapped[list["Certificate"]] = relationship(
        back_populates="milestone", cascade="all, delete-orphan"
    )


class MilestoneRequirement(Base):
    __tablename__ = "milestone_requirements"
    __table_args__ = (UniqueConstraint("milestone_id", "task_id", name="uq_ms_req_ms_task"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    milestone_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False, index=True
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    min_verified_pct: Mapped[float] = mapped_column(Float, nullable=False)

    milestone: Mapped["Milestone"] = relationship(back_populates="requirements")


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    milestone_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False, index=True
    )
    issued_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=False
    )
    issued_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)
    gate_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    certificate_hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    pdf_storage_key: Mapped[str | None] = mapped_column(String(500), nullable=True)

    milestone: Mapped["Milestone"] = relationship(back_populates="certificates")


# ──────────────────────────────────────────────────────────────────────
# Audit log (append-only, hash-chained)
# ──────────────────────────────────────────────────────────────────────


class AuditLog(Base):
    """Append-only, hash-chained audit log.

    hash = SHA256(prev_hash || canonical_json(entry))
    The application never UPDATEs or DELETEs these rows.
    """

    __tablename__ = "audit_log"
    __table_args__ = (
        Index("ix_audit_log_entity", "entity_type", "entity_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    seq: Mapped[int] = mapped_column(Integer, unique=True, nullable=False, index=True)
    actor_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    prev_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    hash: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)


# ──────────────────────────────────────────────────────────────────────
# Jobs (DB-backed job queue)
# ──────────────────────────────────────────────────────────────────────


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        Index("ix_jobs_status", "status"),
        Index("ix_jobs_run_after", "run_after"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="PENDING")
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    run_after: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=_utcnow, onupdate=_utcnow
    )
