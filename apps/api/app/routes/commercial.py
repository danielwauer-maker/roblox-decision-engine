from fastapi import APIRouter

router = APIRouter(prefix="/v1/commercial", tags=["commercial"])

PLANS = [
    {
        "id": "free",
        "name": "Free",
        "monthly_price_usd": 0,
        "experiences": 1,
        "positioning": "Validate the workflow before committing.",
        "features": [
            "Demo workspace",
            "1 connected experience",
            "Weekly decision brief",
        ],
    },
    {
        "id": "indie",
        "name": "Indie",
        "monthly_price_usd": 19,
        "experiences": 1,
        "positioning": "For live indie teams that need a clear weekly priority.",
        "features": [
            "Top-3 decision queue",
            "AI Product Analyst",
            "Experiment Copilot",
            "Weekly Growth Brief",
        ],
    },
    {
        "id": "growth",
        "name": "Growth",
        "monthly_price_usd": 49,
        "experiences": 3,
        "positioning": "For studios running recurring updates and paid acquisition.",
        "features": [
            "Everything in Indie",
            "Up to 3 experiences",
            "Priority evidence history",
            "Pilot feedback workflow",
        ],
    },
    {
        "id": "studio",
        "name": "Studio",
        "monthly_price_usd": 99,
        "experiences": 10,
        "positioning": "For multi-experience teams that need one decision layer.",
        "features": [
            "Everything in Growth",
            "Up to 10 experiences",
            "Portfolio-level weekly review",
            "Priority support",
        ],
    },
]


@router.get("/plans")
def plans() -> dict[str, object]:
    return {
        "currency": "USD",
        "billing_period": "month",
        "pricing_status": "validation",
        "plans": PLANS,
        "early_access": {
            "offer": "30-day guided pilot",
            "price_usd": 0,
            "goal": "Prove that the product creates at least one useful decision before paid conversion.",
        },
    }
