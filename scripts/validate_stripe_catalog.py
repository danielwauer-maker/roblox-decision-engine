"""Read-only Sandbox price/catalog check. Never accepts or calls a live Stripe key."""
import sys
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "apps" / "api"))
from app.commercial_catalog import plans_by_id
from app.config import get_settings
from app.stripe_catalog_validation import validate_price
from app.stripe_constants import STRIPE_API_VERSION


def main() -> int:
    settings = get_settings()
    if settings.stripe_mode != "test":
        print("Refusing validation: STRIPE_MODE must be test"); return 2
    key = settings.stripe_secret_key.get_secret_value() if settings.stripe_secret_key else ""
    if not key.startswith(("sk_test_", "rk_test_")):
        print("Refusing validation: a Sandbox secret/restricted key is required"); return 2
    failures = []
    with httpx.Client(
        base_url="https://api.stripe.com/v1",
        auth=(key, ""),
        headers={"Stripe-Version": STRIPE_API_VERSION},
        timeout=15,
    ) as client:
        for plan_id, plan in plans_by_id().items():
            for customer_type in ("personal", "business"):
                variable = f"stripe_price_{plan_id}_{customer_type}"
                price_id = getattr(settings, variable) or ""
                label = f"{plan_id} {customer_type}"
                if not price_id: failures.append(f"{label}: STRIPE_PRICE_{plan_id.upper()}_{customer_type.upper()} is missing"); continue
                response = client.get(f"/prices/{price_id}", params={"expand[]": "product"})
                if response.is_error: failures.append(f"{label}: Stripe price lookup failed ({response.status_code})"); continue
                price = response.json(); product = price.get("product") or {}
                for problem in validate_price(plan_id, customer_type, plan, price, product): failures.append(f"{label}: {problem}")
    if failures: print("\n".join(failures)); return 1
    print("All six configured Sandbox tax-variant prices match the canonical catalog."); return 0

if __name__ == "__main__": raise SystemExit(main())
