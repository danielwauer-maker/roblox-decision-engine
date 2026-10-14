import asyncio
import json

from app.db import SessionLocal
from app.services.automated_roblox_sync import run_automated_sync


async def _run() -> int:
    summary, results = await run_automated_sync(SessionLocal)
    print(
        json.dumps(
            {
                "summary": summary.as_dict(),
                "results": [
                    {
                        "connection_id": item.connection_id,
                        "organization_id": item.organization_id,
                        "universe_id": item.universe_id,
                        "status": item.status,
                        "error": item.error,
                    }
                    for item in results
                ],
            },
            sort_keys=True,
        )
    )
    return 1 if summary.failed else 0


def main() -> None:
    raise SystemExit(asyncio.run(_run()))


if __name__ == "__main__":
    main()
