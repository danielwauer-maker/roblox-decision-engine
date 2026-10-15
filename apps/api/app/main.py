from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.responses import JSONResponse

from app.config import get_settings
from app.db import Base, engine
from app.reliability import RequestObservabilityMiddleware
from app.routes.admin_communications import router as admin_communications_router
from app.routes.admin_console import router as admin_console_router
from app.routes.admin_simulation import router as admin_simulation_router
from app.routes.analyst import router as analyst_router
from app.routes.billing import router as billing_router
from app.routes.billing_admin import router as billing_admin_router
from app.routes.commercial import router as commercial_router
from app.routes.decisions import router as decisions_router
from app.routes.enrollment import router as enrollment_router
from app.routes.experiments import router as experiments_router
from app.routes.lifecycle import router as lifecycle_router
from app.routes.pilot import router as pilot_router
from app.routes.progress import router as progress_router
from app.routes.r17 import router as r17_router
from app.routes.roblox import router as roblox_router
from app.routes.tenant_insights import router as tenant_insights_router
from app.routes.tenant_notifications import router as tenant_notifications_router
from app.routes.tenants import router as tenant_router
from app.security import SecurityHeadersMiddleware, WriteRateLimitMiddleware


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


settings = get_settings()
app = FastAPI(
    title="PlayDirective API",
    version="1.5.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Request-ID",
        "X-Admin-Token",
        "Stripe-Signature",
    ],
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
app.include_router(tenant_insights_router)
app.include_router(admin_console_router)
app.include_router(admin_communications_router)
app.include_router(admin_simulation_router)
app.include_router(enrollment_router)
app.include_router(progress_router)
app.include_router(lifecycle_router)
app.include_router(tenant_notifications_router)
app.include_router(billing_router)
app.include_router(billing_admin_router)
app.include_router(r17_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "playdirective-api"}


@app.get("/ready", tags=["system"])
def ready():
    stripe_billing_ready = bool(
        settings.stripe_billing_enabled
        and settings.stripe_webhook_secret
        and settings.stripe_portal_configuration_id
        and settings.stripe_price_indie_personal
        and settings.stripe_price_indie_business
        and settings.stripe_price_growth_personal
        and settings.stripe_price_growth_business
        and settings.stripe_price_studio_personal
        and settings.stripe_price_studio_business
    )
    dependency_state = {
        "roblox_configured": bool(settings.roblox_universe_id and settings.roblox_api_key),
        "ai_mode": "model" if settings.openai_api_key else "deterministic",
        "pilot_auth_configured": bool(settings.pilot_admin_token and settings.pilot_credential_key),
        "transactional_email_configured": bool(settings.resend_api_key),
        "stripe_configured": stripe_billing_ready,
    }
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "database": "unavailable", **dependency_state},
        )

    if settings.app_env.lower() == "production" and settings.playdirective_commercial_mode == "standard" and not stripe_billing_ready:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "database": "ok",
                "stripe_billing": "not_configured",
                **dependency_state,
            },
        )

    return {"status": "ready", "database": "ok", **dependency_state}


@app.get("/v1/product", tags=["product"])
def product() -> dict[str, object]:
    return {
        "name": "PlayDirective",
        "positioning": "Decision intelligence for Roblox studios",
        "principle": "Evidence before explanation",
        "status": "founding-studio-pilot",
    }
