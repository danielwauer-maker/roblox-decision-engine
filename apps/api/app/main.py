from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db import Base, engine
from app.routes.analyst import router as analyst_router
from app.routes.decisions import router as decisions_router
from app.routes.experiments import router as experiments_router
from app.routes.pilot import router as pilot_router
from app.routes.roblox import router as roblox_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Roblox Decision Engine API",
    version="0.6.0",
    lifespan=lifespan,
)
app.include_router(roblox_router)
app.include_router(decisions_router)
app.include_router(analyst_router)
app.include_router(experiments_router)
app.include_router(pilot_router)


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "roblox-decision-engine-api"}


@app.get("/v1/product", tags=["product"])
def product() -> dict[str, object]:
    return {
        "name": "Roblox Decision Engine",
        "positioning": "AI Product & Growth Analyst for Roblox studios",
        "principle": "Evidence before explanation",
        "status": "pilot_readiness",
    }
