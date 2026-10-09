"""Get the full traceback for the claims router import failure."""
from __future__ import annotations

import traceback

try:
    import app.api.v1.claims  # noqa: F401
    print("import OK")
except Exception:
    traceback.print_exc()
