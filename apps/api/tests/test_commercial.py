from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_commercial_plans_are_ordered_and_bounded() -> None:
    response = client.get("/v1/commercial/plans")
    assert response.status_code == 200
    payload = response.json()
    assert payload["currency"] == "USD"
    assert payload["pricing_status"] == "validation"
    assert [plan["id"] for plan in payload["plans"]] == ["free", "indie", "growth", "studio"]
    assert [plan["monthly_price_usd"] for plan in payload["plans"]] == [0, 19, 49, 99]
    assert payload["early_access"]["price_usd"] == 0
