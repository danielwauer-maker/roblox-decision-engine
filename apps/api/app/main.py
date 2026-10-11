from fastapi import FastAPI

app = FastAPI(title="Roblox Decision Engine API", version="0.1.0")


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "roblox-decision-engine-api"}


@app.get("/v1/product", tags=["product"])
def product() -> dict[str, object]:
    return {
        "name": "Roblox Decision Engine",
        "positioning": "AI Product & Growth Analyst for Roblox studios",
        "principle": "Evidence before explanation",
        "status": "validation_to_pilot",
    }
