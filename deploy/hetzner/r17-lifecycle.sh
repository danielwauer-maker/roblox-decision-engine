#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/roblox-decision-engine}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"

admin_token="$(grep -E '^PILOT_ADMIN_TOKEN=' "$ENV_FILE" | tail -n1 | cut -d= -f2-)"
if [[ -z "$admin_token" ]]; then
  echo "PILOT_ADMIN_TOKEN is missing" >&2
  exit 1
fi

curl --fail --silent --show-error \
  -X POST \
  -H "X-Admin-Token: $admin_token" \
  http://127.0.0.1:8091/v1/lifecycle/admin/run >/dev/null

curl --fail --silent --show-error \
  -X POST \
  -H "X-Admin-Token: $admin_token" \
  http://127.0.0.1:8091/v1/r17/admin/lifecycle/run >/dev/null

echo "PlayDirective lifecycle completed at $(date -u +%FT%TZ)"
