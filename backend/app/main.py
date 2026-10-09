"""FastAPI application entry point for the Site Audit Platform."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import close_db, init_db

logger = logging.getLogger("siteaudit")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: init DB on startup, dispose on shutdown."""
    settings = get_settings()
    logger.info("Initializing database engine: %s", settings.database_url)
    init_db(settings.database_url)

    # Ensure tables exist in database (both SQLite and Supabase Postgres)
    try:
        from app.db.session import _normalize_database_url
        db_norm = _normalize_database_url(settings.database_url)
        connect_args = {"statement_cache_size": 0} if "pooler.supabase.com" in db_norm else {}
        engine = create_async_engine(db_norm, echo=False, connect_args=connect_args)
        async with engine.begin() as conn:
            # Import models so they register with Base.metadata
            import app.db.models  # noqa: F401

            await conn.run_sync(Base.metadata.create_all)
        await engine.dispose()
        logger.info("Database tables verified/created.")
    except Exception as exc:
        logger.warning("Auto table creation note (Alembic can also be run): %s", exc)

    yield

    await close_db()
    logger.info("Database engine disposed.")


def create_app() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title="Site Audit Platform",
        description=(
            "Role-segregated site audit backend: VLM progress verification, "
            "challan reconciliation, photo tamper detection, material anomaly "
            "detection, and milestone clearance gating."
        ),
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # tighten in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Health / readiness (unauthenticated)
    @app.get("/health", tags=["meta"])
    async def health() -> dict:
        return {"status": "ok"}

    @app.get("/ready", tags=["meta"])
    async def ready() -> dict:
        return {"status": "ready"}

    # Root: service info (unauthenticated). Avoids a bare
    # 404 when clients hit the base URL.
    @app.get("/", tags=["meta"])
    async def root() -> dict:
        return {
            "service": "siteaudit",
            "version": "0.1.0",
            "docs": "/docs",
            "openapi": "/openapi.json",
            "health": "/health",
            "ready": "/ready",
            "api": "/api/v1",
        }

    # Model discovery endpoint (OpenAI / VLM compatible)
    @app.get("/v1/models", tags=["models"])
    @app.get("/api/v1/models", tags=["models"])
    async def list_models() -> dict:
        return {
            "object": "list",
            "data": [
                {
                    "id": "qwen2.5-vl-7b-instruct",
                    "object": "model",
                    "created": 1700000000,
                    "owned_by": "siteaudit",
                },
                {
                    "id": "gemini-1.5-flash",
                    "object": "model",
                    "created": 1700000000,
                    "owned_by": "google",
                },
            ],
        }

    @app.get("/v1/models/{model_id:path}", tags=["models"])
    @app.get("/api/v1/models/{model_id:path}", tags=["models"])
    async def get_model(model_id: str) -> dict:
        return {
            "id": model_id,
            "object": "model",
            "created": 1700000000,
            "owned_by": "siteaudit",
        }

    # Register API routers
    _register_routers(app)

    # Global error handler for unexpected exceptions
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": "internal_error", "message": "Internal server error"},
        )

    return app


def _register_routers(app: FastAPI) -> None:
    """Register all v1 routers. Routers are imported lazily so the app can
    start even if some modules are still under development."""
    from fastapi import APIRouter

    api_router = APIRouter(prefix="/api/v1")

    # Auth
    try:
        from app.api.v1.auth import router as auth_router

        api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
    except ImportError as e:  # noqa: BLE001
        logger.warning("Auth router not yet available: %s", e)

    # Projects
    try:
        from app.api.v1.projects import router as projects_router

        api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
    except ImportError as e:  # noqa: BLE001
        logger.warning("Projects router not yet available: %s", e)

    # BOQ (nested under /projects/{project_id}/boq)
    try:
        from app.api.v1.boq import router as boq_router

        api_router.include_router(
            boq_router, prefix="/projects/{project_id}/boq", tags=["boq"]
        )
    except ImportError as e:  # noqa: BLE001
        logger.warning("BOQ router not yet available: %s", e)

    # Tasks / stages / norms (nested under /projects/{project_id}/tasks)
    try:
        from app.api.v1.tasks import router as tasks_router

        api_router.include_router(
            tasks_router, prefix="/projects/{project_id}/tasks", tags=["tasks"]
        )
    except ImportError as e:  # noqa: BLE001
        logger.warning("Tasks router not yet available: %s", e)

    # Claims
    try:
        from app.api.v1.claims import router as claims_router

        api_router.include_router(claims_router, prefix="/claims", tags=["claims"])
    except ImportError as e:  # noqa: BLE001
        logger.warning("Claims router not yet available: %s", e)

    app.include_router(api_router)


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
