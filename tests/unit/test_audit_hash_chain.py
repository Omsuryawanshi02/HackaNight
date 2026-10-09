"""Tests for the audit-log hash chain (Phase 1 acceptance:
"chain verify detects a manually tampered row")."""
from __future__ import annotations

import uuid

from app.services.audit_log.hash_chain import (
    GENESIS_HASH,
    compute_hash,
    canonical_json,
    verify_chain,
)


def _entry(seq: int, payload: dict, prev_hash: str) -> dict:
    return {
        "seq": seq,
        "actor_id": None,
        "action": "CREATE",
        "entity_type": "project",
        "entity_id": None,
        "payload": payload,
        "prev_hash": prev_hash,
        "hash": compute_hash(prev_hash, payload),
    }


def test_canonical_json_is_deterministic():
    a = canonical_json({"b": 1, "a": 2})
    b = canonical_json({"a": 2, "b": 1})
    assert a == b == '{"a":2,"b":1}'


def test_empty_chain_verifies_clean():
    assert verify_chain([]) == []


def test_valid_chain_verifies_clean():
    e1 = _entry(1, {"name": "P1"}, GENESIS_HASH)
    e2 = _entry(2, {"name": "P2"}, e1["hash"])
    e3 = _entry(3, {"name": "P3"}, e2["hash"])
    assert verify_chain([e1, e2, e3]) == []


def test_tampered_payload_is_detected():
    e1 = _entry(1, {"name": "P1"}, GENESIS_HASH)
    e2 = _entry(2, {"name": "P2"}, e1["hash"])
    # Tamper with e2's payload without recomputing the hash.
    e2["payload"] = {"name": "EVIL"}
    tampered = verify_chain([e1, e2])
    assert len(tampered) == 1
    assert tampered[0]["seq"] == 2


def test_tampered_hash_is_detected():
    e1 = _entry(1, {"name": "P1"}, GENESIS_HASH)
    e2 = _entry(2, {"name": "P2"}, e1["hash"])
    # Overwrite the stored hash with garbage.
    e2["hash"] = "f" * 64
    tampered = verify_chain([e1, e2])
    assert len(tampered) == 1
    assert tampered[0]["seq"] == 2


def test_broken_prev_hash_link_is_detected():
    e1 = _entry(1, {"name": "P1"}, GENESIS_HASH)
    e2 = _entry(2, {"name": "P2"}, e1["hash"])
    # Point e2's prev_hash at the wrong predecessor.
    e2["prev_hash"] = "a" * 64
    # Recompute e2 hash so only the link is broken.
    e2["hash"] = compute_hash(e2["prev_hash"], e2["payload"])
    tampered = verify_chain([e1, e2])
    assert len(tampered) == 1
    assert tampered[0]["seq"] == 2


def test_single_tamper_does_not_cascade():
    """A tampered middle row must not falsely flag later rows."""
    e1 = _entry(1, {"name": "P1"}, GENESIS_HASH)
    e2 = _entry(2, {"name": "P2"}, e1["hash"])
    e3 = _entry(3, {"name": "P3"}, e2["hash"])
    # Tamper only with e2's payload.
    e2["payload"] = {"name": "EVIL"}
    tampered = verify_chain([e1, e2, e3])
    assert [t["seq"] for t in tampered] == [2]


def test_first_entry_must_chain_from_genesis():
    e1 = _entry(1, {"name": "P1"}, "wrong-genesis")
    e1["hash"] = compute_hash(e1["prev_hash"], e1["payload"])
    tampered = verify_chain([e1])
    assert len(tampered) == 1
