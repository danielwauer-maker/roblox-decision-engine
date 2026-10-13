#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/roblox-decision-engine}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/docker-compose.production.yml}"
BACKUP_DIR="${RDE_BACKUP_DIR:-/mnt/HC_Volume_106874499/rde/backups}"
RETENTION_DAYS="${RDE_BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output="$BACKUP_DIR/playdirective-postgres-$timestamp.sql.gz"

cd "$APP_DIR"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' | gzip -9 > "$output"

if [[ ! -s "$output" ]]; then
  echo "Backup is empty: $output" >&2
  exit 1
fi

find "$BACKUP_DIR" -type f -name 'playdirective-postgres-*.sql.gz' -mtime "+$RETENTION_DAYS" -delete
sha256sum "$output" > "$output.sha256"

echo "Backup created: $output"
