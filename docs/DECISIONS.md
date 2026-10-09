# Decisions Log

All significant decisions should be logged here with rationale.

## Initial Project Classification

**Classification:** Architectural
**Reason:** New project with no existing codebase. Involves multiple independent subsystems (auth, RBAC, photo integrity, VLM verification, OCR/reconciliation, anomaly detection, milestones, audit logging). Requires full spec and implementation plan before coding.

## Tech Stack Decisions

- **Python 3.11+** with FastAPI, Pydantic v2, SQLAlchemy 2.0
- **Database:** PostgreSQL production, SQLite for dev/tests
- **Auth:** JWT with access/refresh tokens, passlib[bcrypt]
- **Async jobs:** DB-backed job queue (no Redis/Celery requirement)
- **Images:** Pillow, piexif/exifread, imagehash, numpy, OpenCV (headless)
- **OCR:** pytesseract default, pluggable provider interface
- **VLM:** Gemini multimodal default, pluggable provider interface, Mock for tests
- **Stats:** numpy, scipy; scikit-learn Isolation Forest optional
- **Storage:** Local filesystem abstraction, S3 adapter signature only
- **Quality:** pytest, pytest-asyncio, httpx TestClient, ruff, mypy (strict core/services), pre-commit
- **Ops:** Docker + docker-compose, .env.example, Makefile

## Phase 1 Status: COMPLETE

- Scaffolding (pyproject.toml, Dockerfile, docker-compose.yml, Makefile, .env.example)
- Config (core/config.py), Security (core/security.py: bcrypt + JWT)
- DB models (db/models.py, 21 tables) + Alembic migration (applies cleanly on SQLite)
- Auth router (login/refresh/me), RBAC (core/rbac.py) with project-scoped authorization + IDOR protection
- Audit log hash chain (services/audit_log/hash_chain.py) + append service
- Health/ready endpoints
- Seed script (scripts/seed.py) + E2E test (scripts/e2e_test.py)
- 47 unit tests pass (audit chain tamper detection + RBAC matrix)
- E2E: login, project CRUD, IDOR blocked (403), RBAC enforced (403), anon (401)

## Phase 2 Status: COMPLETE

- BOQ CRUD (app/api/v1/boq.py) under /projects/{project_id}/boq
- Atomic BOQ CSV import (app/services/boq/csv_import.py)
  - Row-level validation with precise row + column error reporting
  - Atomicity: any error (parse, validation, or DB duplicate) => import NOTHING
  - Indian number format (1,00,000.50) supported when field is quoted
  - Unquoted commas detected and rejected (prevents silent mis-import)
- Tasks / Stages / Task-BOQ norms CRUD (app/api/v1/tasks.py)
- 11 CSV import unit tests + 7 BOQ E2E checks pass
- Acceptance met: malformed CSV returns precise row/column errors and imports nothing (atomic)

## Auth / Email Decision

- Seed/test emails use `@siteaudit.io` (valid TLD). The `.local` TLD is reserved
  (RFC 6762) and rejected by pydantic's EmailStr / email-validator, so it cannot
  be used for login credentials in tests.

## Database Decisions

- UUID primary keys across all tables
- Soft-delete only where stated (audit_log and stock_ledger are append-only, no UPDATE/DELETE from app code)
- created_at/updated_at on all mutable tables
- JSON columns for flexible fields (exif_json, anomalies, etc.)
- Indexes on foreign keys, unique constraints, and frequently-filtered columns
- Naming convention for constraints (ix_, uq_, ck_, fk_, pk_) so Alembic autogenerate renders clean DDL
- **work_packages and tasks are one entity** (the spec writes "work_packages / tasks" with a single field set); implemented as the `tasks` table
- **Circular FK avoided**: `claim_photos.vlm_result_id` is a plain back-reference column, NOT a FK. The authoritative FK is `vlm_results.photo_id -> claim_photos.id`. This prevents an insert-order deadlock.
- **Alembic runs a synchronous engine**: async driver URLs (aiosqlite/asyncpg) are translated to sync equivalents (sqlite/psycopg2) in alembic/env.py

## Auth RBAC Decisions

- 5 roles: SITE_SUPERVISOR, STORE_INCHARGE, PROJECT_AUDITOR, ADMIN, VIEWER
- Project-scoped authorization on every object access (IDOR protection)
- Role claims embedded in JWT; checks in dependency layer, never only in UI
- Project members via project_membership table

## Photo Integrity Decisions

- 7 independent checks EXIF presence, geofence, timestamp sanity, tamper heuristics, duplicate/reuse, ELA manipulation, sequence consistency
- Aggregated verdict: PASS/REVIEW/FAIL with weighted scoring
- Each flag carries human-readable evidence + machine-readable severity
- Weights configurable in core/config.py

## VLM Verification Decisions

- Protocol-based provider interface (VisionProvider Protocol)
- GeminiProvider as default real adapter
- MockProvider deterministic, keyed on fixture filename/hash
- Prompt versioning in prompts.py
- Output validated with Pydantic; max 2 retries with repair prompt
- Circuit breaker on repeated provider failure
- Never trust model output as authoritative
- Aggregation in stage_verifier.py: coverage of required cues, weighted by integrity score
- Composite claim score = f(integrity, VLM match, overclaim gap)
- Output: VERIFIED / FLAGGED / REJECTED with reasons

## OCR Reconciliation Decisions

- Pipeline: upload → preprocess → OCR → parser → normalize → BOQ match → reconcile → stock ledger
- Unit canonicalization with config-driven mappings
- Indian number format parsing
- OCR digit-confusion repair only on numeric fields
- Fuzzy token-set matching with rapidfuzz
- All reconciliation rules emit typed findings
- Accepted lines post RECEIPT entries to append-only stock_ledger; corrections are ADJUSTMENT entries

## Anomaly Detection Decisions

- Expected consumption: Σ verified_work_delta × norm_qty_per_unit × (1 + wastage_allowance)
- 6 detectors: norm-deviation ratio (robust z-score), rolling baseline (EWMA + control limits), issue-without-progress, burst/after-hours issues, stock balance integrity, cumulative drift (CUSUM)
- Cold start: fall back to norm-based thresholds, confidence LOW
- Seasonality/weekday effects configurable
- Scores map to alert severity via config thresholds
- De-duplication: same subject + type within cooldown window
- Property-based tests (hypothesis) for unit conversion and number parsing

## Milestone Gate Decisions

- 5 rules all must pass for certificate issuance
- Server-side evaluation at request time AND at issue time in one transaction
- Checklist response on GET /milestones/{id}/gate showing pass/fail + evidence links
- Only PROJECT_AUDITOR may issue
- 409 with checklist if gate fails
- gate_snapshot + certificate_hash (SHA-256 over canonical JSON) persisted
- PDF certificate via reportlab
- Race-safe issuance (one certificate even with concurrent attempts)

## API Decisions

- OpenAPI documented with examples per role
- Consistent error envelope
- Pagination (cursor or limit/offset)
- Idempotency keys on uploads (Idempotency-Key header)
- Rate limiting on auth + uploads
- Cross-cutting: health, ready endpoints

## Security Decisions

- Validate uploads by magic bytes, max size, max dimensions
- Reject decompression bombs
- Strip path components in storage keys
- Store under random keys
- Never serve uploads without authorization
- Structured JSON logging with request IDs
- Audit log hash-chain: hash = SHA256(prev_hash || canonical_json(entry))
- No UPDATE/DELETE on audit_log and stock_ledger from app code
- Secrets only via env; no secrets in logs

## Performance Decisions

- Claim with 6 photos < 30s with Mock providers on laptop
- List endpoints < 200ms at 10k rows
- Background job processing with exponential backoff
- Poison-job quarantine after max_attempts

## Testing Decisions

- Unit tests for every detector, parser, normalizer, rule
- Integration tests through HTTP API per role
- Golden-file tests for OCR parsing and VLM prompt rendering
- tests/eval/ harness for precision/recall and flag accuracy
- CI: make test, make lint, make typecheck, make demo
- Coverage ≥ 85% on services/

## Phase Ordering Decisions

Phases must execute in order since each builds on the previous:
1. Foundation (models, auth, audit log, Docker)
2. Admin + BOQ + Tasks (CRUD, CSV import)
3. Photo Integrity Engine (all 7 checks, fixture generator)
4. VLM Verification (providers, prompts, aggregation, workers)
5. OCR + Reconciliation (preprocessing, parser, normalizer, rules, ledger)
6. Anomaly Detection + Alerts (model, detectors, engine, dedup)
7. Milestone Gate + Certificates (evaluator, checklist, PDF)
8. Hardening + Demo (security tests, rate limits, end-to-end flow)