from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.responses import JSONResponse

from app.config import get_settings
from app.db import Base, engine
from app.reliability import RequestObservabilityMiddleware
from app.routes.analyst import router as analyst_router
from app.routes.commercial import router as commercial_router
from app.routes.decisions import router as decisions_router
from app.routes.experiments import router as experiments_router
from app.routes.pilot import router as pilot_router
from app.routes.roblox import router as roblox_router
from app.routes.tenants import router as tenant_router
from app.security import SecurityHeadersMiddleware, WriteRateLimitMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


settings = get_settings()
app = FastAPI(
    title="Roblox Decision Engine API",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID", "X-Admin-Token"],
)
app.add_middleware(
    WriteRateLimitMiddleware,
    requests_per_minute=settings.write_rate_limit_per_minute,
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestObservabilityMiddleware)

app.include_router(roblox_router)
app.include_router(decisions_router)
app.include_router(analyst_router)
app.include_router(experiments_router)
app.include_router(pilot_router)
app.include_router(commercial_router)
app.include_router(tenant_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "roblox-decision-engine-api"}


@app.get("/ready", tags=["system"])
def ready():
    dependency_state = {
        "roblox_configured": bool(settings.roblox_universe_id and settings.roblox_api_key),
        "ai_mode": "model" if settings.openai_api_key else "deterministic",
        "pilot_auth_configured": bool(settings.pilot_admin_token and settings.pilot_credential_key),
    }
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": "unavailable", **dependency_state},
        )

    return {"status": "ready", "database": "ok", **dependency_state}


@app.get("/v1/product", tags=["product"])
def product() -> dict[str, object]:
    return {
        "name": "Roblox Decision Engine",
        "positioning": "AI Product & Growth Analyst for Roblox studios",
        "principle": "Evidence before explanation",
        "status": "multi-tenant-pilot",
    }
