"""Append-only, hash-chained audit log service.

Each entry's hash is computed as:

    hash = SHA256(prev_hash || canonical_json(payload))

where ``canonical_json`` is compact JSON with sorted keys. The chain is
ordered by the monotonically increasing ``seq`` column. The application
never UPDATEs or DELETEs audit_log rows.
"""
from __future__ import annotations

import hashlib
import json
from typing import Any

# Genesis hash for the first entry in the chain.
GENESIS_HASH = "0" * 64


def canonical_json(payload: dict[str, Any]) -> str:
    """Return a deterministic compact JSON string for hashing."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def compute_hash(prev_hash: str, payload: dict[str, Any]) -> str:
    """Compute the chain hash for an entry given the previous hash and payload."""
    data = prev_hash + canonical_json(payload)
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


class ChainBreak(Exception):
    """Raised when the audit log chain is found to be tampered."""

    def __init__(self, seq: int, message: str):
        self.seq = seq
        self.message = message
        super().__init__(f"Chain break at seq {seq}: {message}")


def verify_chain(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Verify an ordered list of audit-log entries (as dicts).

    Each entry must contain ``seq``, ``prev_hash``, ``hash`` and ``payload``.
    Returns a list of tampered entry dicts (empty when the chain is intact).
    The first entry must chain from ``GENESIS_HASH``.
    """
    tampered: list[dict[str, Any]] = []
    expected_prev = GENESIS_HASH

    for entry in entries:
        seq = entry.get("seq")
        prev_hash = entry.get("prev_hash", "")
        stored_hash = entry.get("hash", "")
        payload = entry.get("payload", {})

        computed = compute_hash(prev_hash, payload)

        problems: list[str] = []
        if prev_hash != expected_prev:
            problems.append(
                f"prev_hash mismatch: expected {expected_prev}, got {prev_hash}"
            )
        if computed != stored_hash:
            problems.append(
                f"hash mismatch: expected {computed}, got {stored_hash}"
            )

        if problems:
            tampered.append(
                {
                    "seq": seq,
                    "entity_type": entry.get("entity_type"),
                    "entity_id": entry.get("entity_id"),
                    "action": entry.get("action"),
                    "problems": problems,
                }
            )

        # Always advance to the stored hash so a single tampered row does not
        # cascade into false positives for every subsequent row.
        expected_prev = stored_hash

    return tampered
