"""Phase 2 acceptance tests for BOQ CSV import.

Criterion: "importing a malformed CSV returns precise
row/column errors and imports nothing (atomic)."
"""
from __future__ import annotations

from app.services.boq.csv_import import parse_boq_csv


VALID_CSV = """item_code,description,unit,planned_qty,tolerance_pct,rate,category
CEM-001,Ordinary Portland Cement,bag,500,10,350,cement
STL-001,TMT Rebar 16mm,MT,12.5,5,52000,steel
"""


def test_valid_csv_parses_all_rows():
    result = parse_boq_csv(VALID_CSV)
    assert result.valid, result.errors
    assert len(result.rows) == 2
    assert result.rows[0].item_code == "CEM-001"
    assert result.rows[0].planned_qty == 500.0
    assert result.rows[0].category == "cement"
    assert result.rows[1].item_code == "STL-001"
    assert result.rows[1].unit == "MT"


def test_missing_required_column_reports_header_error():
    csv_text = "item_code,description,unit\nCEM-001,Cement,bag"
    result = parse_boq_csv(csv_text)
    assert not result.valid
    assert any(e.row == 0 and e.column == "header" for e in result.errors)
    assert "planned_qty" in result.errors[0].message
    assert result.rows == []


def test_non_numeric_planned_qty_reports_row_and_column():
    csv_text = (
        "item_code,description,unit,planned_qty\n"
        "CEM-001,Cement,bag,abc\n"
        "STL-001,Rebar,MT,12.5\n"
    )
    result = parse_boq_csv(csv_text)
    assert not result.valid
    err = [e for e in result.errors if e.row == 1]
    assert len(err) == 1
    assert err[0].column == "planned_qty"
    assert "not a number" in err[0].message
    # The valid row is still collected.
    assert len(result.rows) == 1
    assert result.rows[0].item_code == "STL-001"


def test_duplicate_item_code_within_file_is_rejected():
    csv_text = (
        "item_code,description,unit,planned_qty\n"
        "CEM-001,Cement,bag,500\n"
        "CEM-001,Cement again,bag,100\n"
    )
    result = parse_boq_csv(csv_text)
    assert not result.valid
    dup = [e for e in result.errors if e.column == "item_code" and e.row == 2]
    assert len(dup) == 1
    assert "duplicate" in dup[0].message.lower()


def test_invalid_category_is_rejected():
    csv_text = (
        "item_code,description,unit,planned_qty,category\n"
        "CEM-001,Cement,bag,500,platinum\n"
    )
    result = parse_boq_csv(csv_text)
    assert not result.valid
    assert any(
        e.column == "category" and "allowed set" in e.message
        for e in result.errors
    )


def test_negative_planned_qty_is_rejected():
    csv_text = (
        "item_code,description,unit,planned_qty\n"
        "CEM-001,Cement,bag,-5\n"
    )
    result = parse_boq_csv(csv_text)
    assert not result.valid
    assert any(
        e.column == "planned_qty" and "> 0" in e.message
        for e in result.errors
    )


def test_missing_required_field_is_rejected():
    csv_text = (
        "item_code,description,unit,planned_qty\n"
        ",Cement,bag,500\n"
    )
    result = parse_boq_csv(csv_text)
    assert not result.valid
    assert any(
        e.column == "item_code" and "required" in e.message
        for e in result.errors
    )


def test_indian_number_format_is_parsed_when_quoted():
    # Indian-format numbers contain commas, so the CSV field
    # MUST be quoted to survive the comma-delimited parser.
    csv_text = (
        "item_code,description,unit,planned_qty\n"
        'CEM-001,Cement,bag,"1,00,000.50"\n'
    )
    result = parse_boq_csv(csv_text)
    assert result.valid, result.errors
    assert result.rows[0].planned_qty == 100000.50


def test_unquoted_comma_in_number_is_rejected():
    # An unquoted Indian number splits into extra columns;
    # the import must reject the row instead of mis-importing.
    csv_text = (
        "item_code,description,unit,planned_qty\n"
        "CEM-001,Cement,bag,1,00,000.50\n"
    )
    result = parse_boq_csv(csv_text)
    assert not result.valid
    assert any(
        e.column == "row" and "extra columns" in e.message
        for e in result.errors
    )
    assert result.rows == []


def test_optional_fields_default_when_blank():
    csv_text = (
        "item_code,description,unit,planned_qty\n"
        "CEM-001,Cement,bag,500\n"
    )
    result = parse_boq_csv(csv_text)
    assert result.valid, result.errors
    row = result.rows[0]
    assert row.tolerance_pct == 10.0
    assert row.rate == 0.0
    assert row.category == "other"


def test_empty_csv_has_header_error():
    result = parse_boq_csv("")
    assert not result.valid
    assert result.errors[0].column == "header"
