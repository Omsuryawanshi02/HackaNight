"""Tests for the RBAC permission matrix (Phase 1 acceptance:
"RBAC matrix tests pass")."""
from __future__ import annotations

import pytest

from app.core.rbac import Role, role_has_permission


# (role, resource, action, expected)
MATRIX = [
    # SITE_SUPERVISOR
    ("SITE_SUPERVISOR", "claim", "write", True),
    ("SITE_SUPERVISOR", "claim", "read", True),
    ("SITE_SUPERVISOR", "project", "read", True),
    ("SITE_SUPERVISOR", "task", "read", True),
    ("SITE_SUPERVISOR", "stage", "read", True),
    # Forbidden for supervisor
    ("SITE_SUPERVISOR", "project", "admin", False),
    ("SITE_SUPERVISOR", "claim", "override", False),
    ("SITE_SUPERVISOR", "alert", "resolve", False),
    ("SITE_SUPERVISOR", "milestone", "certify", False),
    ("SITE_SUPERVISOR", "user", "admin", False),
    # STORE_INCHARGE
    ("STORE_INCHARGE", "challan", "write", True),
    ("STORE_INCHARGE", "challan", "read", True),
    ("STORE_INCHARGE", "issue", "write", True),
    ("STORE_INCHARGE", "stock", "read", True),
    ("STORE_INCHARGE", "boq", "read", True),
    # Forbidden for store in-charge
    ("STORE_INCHARGE", "claim", "write", False),
    ("STORE_INCHARGE", "milestone", "certify", False),
    ("STORE_INCHARGE", "user", "admin", False),
    # PROJECT_AUDITOR
    ("PROJECT_AUDITOR", "claim", "read", True),
    ("PROJECT_AUDITOR", "claim", "override", True),
    ("PROJECT_AUDITOR", "alert", "resolve", True),
    ("PROJECT_AUDITOR", "anomaly", "read", True),
    ("PROJECT_AUDITOR", "milestone", "certify", True),
    ("PROJECT_AUDITOR", "audit_log", "read", True),
    ("PROJECT_AUDITOR", "stock", "read", True),
    # Forbidden for auditor
    ("PROJECT_AUDITOR", "project", "admin", False),
    ("PROJECT_AUDITOR", "user", "admin", False),
    ("PROJECT_AUDITOR", "claim", "write", False),
    # ADMIN
    ("ADMIN", "user", "admin", True),
    ("ADMIN", "project", "admin", True),
    ("ADMIN", "project", "write", True),
    ("ADMIN", "boq", "admin", True),
    ("ADMIN", "milestone", "admin", True),
    ("ADMIN", "threshold", "admin", True),
    ("ADMIN", "claim", "read", True),
    ("ADMIN", "alert", "resolve", True),
    ("ADMIN", "audit_log", "read", True),
    # ADMIN may not write claims (least privilege)
    ("ADMIN", "claim", "write", False),
]


@pytest.mark.parametrize("role_str,resource,action,expected", MATRIX)
def test_permission_matrix(role_str, resource, action, expected):
    role = Role(role_str)
    assert role_has_permission(role, resource, action) is expected


def test_admin_has_more_permissions_than_supervisor():
    admin = PERMISSIONS_COUNT(Role.ADMIN)
    sup = PERMISSIONS_COUNT(Role.SITE_SUPERVISOR)
    assert admin > sup


def PERMISSIONS_COUNT(role):
    from app.core.rbac import PERMISSIONS

    return len(PERMISSIONS[role])
