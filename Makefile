.PHONY: dev down logs migrate test

dev:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	python scripts/apply_migrations.py

test:
	cd apps/api && pytest -q && ruff check .
	cd apps/web && npm run build
