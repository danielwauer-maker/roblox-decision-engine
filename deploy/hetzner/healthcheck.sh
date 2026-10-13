#!/usr/bin/env bash
set -euo pipefail

PUBLIC_URL="${PUBLIC_URL:-https://playdirective.com}"

curl --fail --silent --show-error "$PUBLIC_URL" >/dev/null
curl --fail --silent --show-error http://127.0.0.1:8091/health >/dev/null
curl --fail --silent --show-error http://127.0.0.1:8091/ready | grep -q '"status":"ready"'

docker ps --format '{{.Names}} {{.Status}}' | grep -q '^rde-postgres .*Up'
docker ps --format '{{.Names}} {{.Status}}' | grep -q '^rde-api .*Up'
docker ps --format '{{.Names}} {{.Status}}' | grep -q '^rde-web .*Up'

echo "PlayDirective healthcheck passed at $(date -u +%FT%TZ)"
