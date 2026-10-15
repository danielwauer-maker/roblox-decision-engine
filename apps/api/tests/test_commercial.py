from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_commercial_plans_match_the_v1_catalog() -> None:
    response = client.get("/v1/commercial/plans")
    assert response.status_code == 200
    payload = response.json()
    assert payload["currency"] == "USD"
    assert payload["billing_period"] == "month"
    assert [plan["plan_id"] for plan in payload["plans"]] == ["indie", "growth", "studio"]
    assert [plan["monthly_price_usd"] for plan in payload["plans"]] == [24, 59, 119]
    assert payload["pilot"]["duration_days"] == 30
    assert payload["pilot"]["payment_method_required"] is False
    assert payload["pilot"]["automatic_paid_conversion"] is False
