.PHONY: dev down logs test

dev:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

test:
	cd apps/api && pytest -q && ruff check .
	cd apps/web && npm run build
