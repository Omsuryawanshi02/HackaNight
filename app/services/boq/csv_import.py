"""BOQ CSV import with row-level validation.

The import is atomic: if any row fails validation, NOTHING is
imported and every error is reported with its row number and
column so the uploader can fix the file and retry.
"""
from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass, field
from typing import Any

# Allowed material categories (per the data model).
ALLOWED_CATEGORIES = frozenset(
    {"cement", "steel", "sand", "aggregate", "brick", "tile", "paint", "other"}
)

# Minimum required columns in the CSV header.
REQUIRED_COLUMNS = ("item_code", "description", "unit", "planned_qty")

# Columns with defaults when omitted.
DEFAULT_TOLERANCE_PCT = 10.0
DEFAULT_RATE = 0.0
DEFAULT_CATEGORY = "other"


@dataclass
class BOQRowDraft:
    """A validated BOQ row ready for insertion."""

    item_code: str
    description: str
    unit: str
    planned_qty: float
    tolerance_pct: float
    rate: float
    category: str


@dataclass
class RowError:
    """A single validation error tied to a CSV row and column."""

    row: int  # 1-based data row number (excluding header)
    column: str
    message: str


@dataclass
class ImportResult:
    rows: list[BOQRowDraft] = field(default_factory=list)
    errors: list[RowError] = field(default_factory=list)

    @property
    def valid(self) -> bool:
        return not self.errors


def parse_indian_number(value: str) -> float:
    """Parse a number that may use Indian digit grouping.

    Accepts ``1,00,000.50``, ``100000.50``, ``100,000.50`` and
    plain ``123.45``. Raises ``ValueError`` when not numeric.
    """
    cleaned = value.strip().replace(",", "")
    if cleaned == "":
        raise ValueError("empty value")
    return float(cleaned)


def _is_number(value: str) -> bool:
    try:
        parse_indian_number(value)
        return True
    except ValueError:
        return False


def parse_boq_csv(csv_text: str) -> ImportResult:
    """Parse and validate a BOQ CSV document.

    Returns an :class:`ImportResult` containing either the validated
    row drafts or the full list of row/column errors.
    """
    result = ImportResult()
    reader = csv.DictReader(io.StringIO(csv_text))

    # Validate the header first.
    fieldnames = [f.strip().lower() if f else "" for f in (reader.fieldnames or [])]
    missing = [c for c in REQUIRED_COLUMNS if c not in fieldnames]
    if missing:
        # Treat as a single header-level error on row 0.
        result.errors.append(
            RowError(row=0, column="header", message=f"missing required columns: {', '.join(missing)}")
        )
        return result

    seen_codes: dict[str, int] = {}  # item_code -> first row it appeared on

    for index, raw in enumerate(reader, start=1):
        # csv.DictReader stores surplus fields (more values than the
        # header) under the None "restkey". This happens when a field
        # containing commas (e.g. an Indian-format number) is NOT
        # quoted. Reject such rows rather than silently mis-importing.
        extra = raw.get(None)
        if extra:
            result.errors.append(
                RowError(
                    index,
                    "row",
                    "unexpected extra columns; quote fields that contain "
                    f"commas (e.g. \"1,00,000.50\"). Extra: {extra}",
                )
            )
            continue

        # Normalise keys to lowercase, drop None keys.
        row = {
            (k.strip().lower() if k else ""): (v if v is not None else "")
            for k, v in raw.items()
        }

        # item_code
        item_code = (row.get("item_code") or "").strip()
        if not item_code:
            result.errors.append(
                RowError(index, "item_code", "item_code is required")
            )
        elif item_code in seen_codes:
            result.errors.append(
                RowError(
                    index,
                    "item_code",
                    f"duplicate item_code '{item_code}' (first seen on row {seen_codes[item_code]})",
                )
            )
        else:
            seen_codes[item_code] = index

        # description
        description = (row.get("description") or "").strip()
        if not description:
            result.errors.append(
                RowError(index, "description", "description is required")
            )

        # unit
        unit = (row.get("unit") or "").strip()
        if not unit:
            result.errors.append(RowError(index, "unit", "unit is required"))

        # planned_qty
        planned_qty_raw = (row.get("planned_qty") or "").strip()
        planned_qty: float | None = None
        if not planned_qty_raw:
            result.errors.append(
                RowError(index, "planned_qty", "planned_qty is required")
            )
        elif not _is_number(planned_qty_raw):
            result.errors.append(
                RowError(index, "planned_qty", f"'{planned_qty_raw}' is not a number")
            )
        else:
            planned_qty = parse_indian_number(planned_qty_raw)
            if planned_qty <= 0:
                result.errors.append(
                    RowError(index, "planned_qty", "planned_qty must be > 0")
                )

        # tolerance_pct (optional)
        tolerance_raw = (row.get("tolerance_pct") or "").strip()
        tolerance_pct = DEFAULT_TOLERANCE_PCT
        if tolerance_raw:
            if not _is_number(tolerance_raw):
                result.errors.append(
                    RowError(index, "tolerance_pct", f"'{tolerance_raw}' is not a number")
                )
            else:
                tolerance_pct = parse_indian_number(tolerance_raw)
                if tolerance_pct < 0:
                    result.errors.append(
                        RowError(index, "tolerance_pct", "tolerance_pct must be >= 0")
                    )

        # rate (optional)
        rate_raw = (row.get("rate") or "").strip()
        rate = DEFAULT_RATE
        if rate_raw:
            if not _is_number(rate_raw):
                result.errors.append(
                    RowError(index, "rate", f"'{rate_raw}' is not a number")
                )
            else:
                rate = parse_indian_number(rate_raw)
                if rate < 0:
                    result.errors.append(
                        RowError(index, "rate", "rate must be >= 0")
                    )

        # category (optional)
        category = (row.get("category") or "").strip().lower() or DEFAULT_CATEGORY
        if category not in ALLOWED_CATEGORIES:
            result.errors.append(
                RowError(
                    index,
                    "category",
                    f"'{category}' not in allowed set: {', '.join(sorted(ALLOWED_CATEGORIES))}",
                )
            )

        # Only collect a draft when the row has no errors so far.
        row_has_error = any(e.row == index for e in result.errors)
        if not row_has_error and planned_qty is not None:
            result.rows.append(
                BOQRowDraft(
                    item_code=item_code,
                    description=description,
                    unit=unit,
                    planned_qty=planned_qty,
                    tolerance_pct=tolerance_pct,
                    rate=rate,
                    category=category,
                )
            )

    return result
