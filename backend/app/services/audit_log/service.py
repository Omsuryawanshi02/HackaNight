"""Service that appends entries to the audit log inside a transaction."""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AuditLog
from app.services.audit_log.hash_chain import GENESIS_HASH, compute_hash


async def _next_seq(session: AsyncSession) -> int:
    """Return the next sequence number (max + 1)."""
    result = await session.execute(select(func.max(AuditLog.seq)))
    current_max = result.scalar_one_or_none()
    return (current_max or 0) + 1


async def _last_hash(session: AsyncSession) -> str:
    """Return the hash of the most recent entry, or genesis."""
    result = await session.execute(
        select(AuditLog.hash).order_by(AuditLog.seq.desc()).limit(1)
    )
    last = result.scalar_one_or_none()
    return last or GENESIS_HASH


async def append_audit_entry(
    session: AsyncSession,
    *,
    actor_id: uuid.UUID | None,
    action: str,
    entity_type: str,
    entity_id: uuid.UUID | None,
    payload: dict[str, Any] | None = None,
) -> AuditLog:
    """Append a new entry to the hash-chained audit log.

    The caller is responsible for committing the transaction. This
    function only stages the INSERT; the hash is computed against the
    current chain head at call time.
    """
    seq = await _next_seq(session)
    prev_hash = await _last_hash(session)
    payload = payload or {}

    entry_hash = compute_hash(prev_hash, payload)

    entry = AuditLog(
        seq=seq,
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        payload=payload,
        prev_hash=prev_hash,
        hash=entry_hash,
    )
    session.add(entry)
    return entry
