import json

import httpx
import pytest
from pydantic import SecretStr

from app.config import Settings
from app.domain.decision_engine import DecisionSnapshot, evaluate_snapshot
from app.services.ai_analyst import generate_analyst_brief


def _priorities():
    return evaluate_snapshot(
        DecisionSnapshot(
            d1_retention_mobile=0.087,
            d1_retention_desktop=0.179,
        )
    )


@pytest.mark.asyncio
async def test_model_provider_merges_prose_with_deterministic_actions() -> None:
    priorities = _priorities()
    generated = {
        "executive_summary": "Mobile onboarding is the clearest product constraint to investigate first.",
        "priorities": [
            {
                "key": priorities[0].key,
                "summary": "Mobile retention materially trails the comparison segment.",
                "why_it_matters": "The divergence is strong enough to justify a focused product investigation.",
            }
        ],
        "data_quality_note": "The surfaced signal is supported by a direct segment comparison.",
    }

    async def handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        assert body["model"] == "gpt-6-luna"
        assert body["store"] is False
        assert body["text"]["format"]["type"] == "json_schema"
        return httpx.Response(
            200,
            json={
                "output": [
                    {
                        "type": "message",
                        "content": [{"type": "output_text", "text": json.dumps(generated)}],
                    }
                ]
            },
        )

    settings = Settings(openai_api_key=SecretStr("test-key"))
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await generate_analyst_brief(priorities, settings=settings, client=client)

    assert result.mode == "model"
    assert result.model == "gpt-6-luna"
    assert result.brief.priorities[0].summary == generated["priorities"][0]["summary"]
    assert result.brief.priorities[0].next_action == priorities[0].recommendation
    assert result.brief.priorities[0].evidence


@pytest.mark.asyncio
async def test_unsupported_number_forces_deterministic_fallback() -> None:
    priorities = _priorities()
    generated = {
        "executive_summary": "Retention is down by 42 percent and needs attention.",
        "priorities": [
            {
                "key": priorities[0].key,
                "summary": "The mobile segment needs attention.",
                "why_it_matters": "The divergence is material.",
            }
        ],
        "data_quality_note": "Evidence is available.",
    }

    async def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "output": [
                    {
                        "type": "message",
                        "content": [{"type": "output_text", "text": json.dumps(generated)}],
                    }
                ]
            },
        )

    settings = Settings(openai_api_key=SecretStr("test-key"))
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await generate_analyst_brief(priorities, settings=settings, client=client)

    assert result.mode == "deterministic_fallback"
    assert "unsupported numeric value" in (result.fallback_reason or "")


@pytest.mark.asyncio
async def test_provider_outage_after_retries_uses_deterministic_fallback() -> None:
    calls = 0

    async def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(503, request=request)

    settings = Settings(
        openai_api_key=SecretStr("test-key"),
        external_retry_attempts=2,
        external_retry_backoff_seconds=0,
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await generate_analyst_brief(_priorities(), settings=settings, client=client)

    assert result.mode == "deterministic_fallback"
    assert "failed after retries" in (result.fallback_reason or "")
    assert calls == 2


@pytest.mark.asyncio
async def test_malformed_model_json_after_repair_uses_deterministic_fallback() -> None:
    calls = 0

    async def handler(_: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(
            200,
            json={
                "output": [
                    {
                        "type": "message",
                        "content": [{"type": "output_text", "text": "not-json"}],
                    }
                ]
            },
        )

    settings = Settings(openai_api_key=SecretStr("test-key"))
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await generate_analyst_brief(_priorities(), settings=settings, client=client)

    assert result.mode == "deterministic_fallback"
    assert result.fallback_reason == "Model provider returned invalid JSON"
    assert calls == 2


@pytest.mark.asyncio
async def test_missing_model_key_uses_deterministic_mode() -> None:
    result = await generate_analyst_brief(_priorities(), settings=Settings(openai_api_key=None))

    assert result.mode == "deterministic"
    assert result.model is None
    assert result.fallback_reason == "OPENAI_API_KEY is not configured"
