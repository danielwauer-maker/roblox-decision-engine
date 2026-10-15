from fastapi import APIRouter

from app.commercial_catalog import catalog
from app.config import get_settings

router = APIRouter(prefix="/v1/commercial", tags=["commercial"])


@router.get("/plans")
def plans() -> dict[str, object]:
    source = catalog()
    return {
        "currency": source["currency"],
        "billing_period": source["billing_period"],
        "commercial_mode": get_settings().playdirective_commercial_mode,
        "pilot": source["pilot"],
        "plans": source["plans"],
    }
