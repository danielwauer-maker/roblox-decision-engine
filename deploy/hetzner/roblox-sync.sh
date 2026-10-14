#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/roblox-decision-engine}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/docker-compose.production.yml}"

cd "$APP_DIR"

docker compose \
  --env-file "$ENV_FILE" \
  -f "$COMPOSE_FILE" \
  exec -T api python -m app.jobs.roblox_sync

echo "PlayDirective automated Roblox sync completed at $(date -u +%FT%TZ)"
