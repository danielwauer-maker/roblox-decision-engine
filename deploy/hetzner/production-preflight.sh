#!/usr/bin/env bash
set -uo pipefail

APP_DIR="${APP_DIR:-/opt/roblox-decision-engine}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/docker-compose.production.yml}"
BACKUP_DIR="${RDE_BACKUP_DIR:-/mnt/HC_Volume_106874499/rde/backups}"

failures=0
warnings=0

pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; warnings=$((warnings + 1)); }
fail() { printf 'FAIL  %s\n' "$1"; failures=$((failures + 1)); }

check_env() {
  local key="$1"
  local required="${2:-true}"
  local value=""
  if [[ -f "$ENV_FILE" ]]; then
    value="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
  fi
  if [[ -n "$value" ]]; then
    pass "$key is configured"
  elif [[ "$required" == "true" ]]; then
    fail "$key is missing"
  else
    warn "$key is not configured"
  fi
}

printf 'PlayDirective production preflight\n'
printf '================================\n'
printf 'UTC: %s\n' "$(date -u +%FT%TZ)"

if [[ ! -d "$APP_DIR/.git" ]]; then
  fail "production repository not found at $APP_DIR"
  exit 1
fi

cd "$APP_DIR"

printf '\n[Git]\n'
printf 'Commit: %s\n' "$(git rev-parse --short=12 HEAD 2>/dev/null || echo unknown)"
if [[ -z "$(git status --porcelain 2>/dev/null)" ]]; then
  pass "working tree is clean"
else
  fail "working tree has local changes"
  git status --short
fi

printf '\n[Configuration presence — values are never printed]\n'
if [[ -f "$ENV_FILE" ]]; then
  pass ".env.production exists"
else
  fail ".env.production is missing"
fi
check_env "PILOT_ADMIN_TOKEN"
check_env "PILOT_CREDENTIAL_KEY"
check_env "RESEND_API_KEY"
check_env "EMAIL_FROM"
check_env "OPERATOR_EMAIL"
check_env "LEGAL_OPERATOR_NAME"
check_env "LEGAL_STREET_ADDRESS"
check_env "LEGAL_POSTAL_CITY"
check_env "LEGAL_COUNTRY"
check_env "LEGAL_EMAIL"
check_env "STRIPE_MODE"
check_env "STRIPE_TEST_BILLING_MODE"
check_env "STRIPE_MANAGED_PAYMENTS_ENABLED"
stripe_mode="$(grep -E '^STRIPE_MODE=' "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
test_billing="$(grep -E '^STRIPE_TEST_BILLING_MODE=' "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
managed_payments="$(grep -E '^STRIPE_MANAGED_PAYMENTS_ENABLED=' "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
commercial_mode="$(grep -E '^PLAYDIRECTIVE_COMMERCIAL_MODE=' "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d= -f2- || true)"
if [[ "$stripe_mode" == "live" ]]; then pass "STRIPE_MODE is live"; else fail "production requires STRIPE_MODE=live"; fi
if [[ "$test_billing" == "false" ]]; then pass "test billing is disabled in production"; else fail "STRIPE_TEST_BILLING_MODE must be false in production"; fi
if [[ "$managed_payments" == "true" ]]; then
  for key in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET STRIPE_PORTAL_CONFIGURATION_ID STRIPE_PRICE_INDIE_PERSONAL STRIPE_PRICE_INDIE_BUSINESS STRIPE_PRICE_GROWTH_PERSONAL STRIPE_PRICE_GROWTH_BUSINESS STRIPE_PRICE_STUDIO_PERSONAL STRIPE_PRICE_STUDIO_BUSINESS; do
    check_env "$key"
  done
  if grep -E '^STRIPE_SECRET_KEY=(sk_live_|rk_live_)' "$ENV_FILE" >/dev/null 2>&1; then pass "Stripe key has a live-mode prefix"; else fail "Managed Payments requires a live-mode Stripe key"; fi
elif [[ "$commercial_mode" == "standard" ]]; then
  fail "standard production billing requires explicit Managed Payments enablement after Stripe approval"
else
  warn "Managed Payments remains disabled; production stays in the no-paid-checkout Pilot lane"
fi

printf '\n[Containers]\n'
if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps >/dev/null 2>&1; then
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
else
  fail "docker compose production stack cannot be inspected"
fi

for name in rde-postgres rde-api rde-web; do
  status="$(docker inspect -f '{{.State.Status}}' "$name" 2>/dev/null || true)"
  if [[ "$status" == "running" ]]; then
    pass "$name is running"
  else
    fail "$name is not running"
  fi
done

pg_health="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' rde-postgres 2>/dev/null || true)"
if [[ "$pg_health" == "healthy" ]]; then
  pass "PostgreSQL container health is healthy"
else
  fail "PostgreSQL container health is $pg_health"
fi

printf '\n[HTTP]\n'
health="$(curl --fail --silent --show-error http://127.0.0.1:8091/health 2>/dev/null || true)"
if [[ "$health" == *'"status":"ok"'* ]]; then
  pass "/health reports ok"
else
  fail "/health did not report ok"
fi
ready="$(curl --fail --silent --show-error http://127.0.0.1:8091/ready 2>/dev/null || true)"
if [[ "$ready" == *'"status":"ready"'* && "$ready" == *'"database":"ok"'* ]]; then
  pass "/ready reports ready with database ok"
else
  fail "/ready did not report ready/database ok"
fi
if curl --fail --silent --show-error --location https://playdirective.com/ >/dev/null 2>&1; then
  pass "canonical public site responds"
else
  fail "canonical public site is unreachable from production host"
fi

printf '\n[Scheduled operations]\n'
cron_file="/etc/cron.d/playdirective-r17"
if [[ -r "$cron_file" ]]; then
  pass "$cron_file exists"
  for script in backup-postgres.sh roblox-sync.sh r17-lifecycle.sh healthcheck.sh; do
    if grep -q "$script" "$cron_file"; then
      pass "cron references $script"
    else
      fail "cron does not reference $script"
    fi
  done
else
  fail "$cron_file is missing or unreadable"
fi

printf '\n[Backup]\n'
latest_backup="$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'playdirective-postgres-*.sql.gz' -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -n1 | cut -d' ' -f2- || true)"
if [[ -n "$latest_backup" && -s "$latest_backup" ]]; then
  age_seconds=$(( $(date +%s) - $(stat -c %Y "$latest_backup") ))
  printf 'Latest backup: %s (%sh old)\n' "$(basename "$latest_backup")" "$((age_seconds / 3600))"
  if (( age_seconds <= 129600 )); then
    pass "latest PostgreSQL backup is no older than 36 hours"
  else
    fail "latest PostgreSQL backup is older than 36 hours"
  fi
  if [[ -f "$latest_backup.sha256" ]] && (cd "$(dirname "$latest_backup")" && sha256sum -c "$(basename "$latest_backup.sha256")" >/dev/null 2>&1); then
    pass "latest backup checksum verifies"
  else
    fail "latest backup checksum is missing or invalid"
  fi
else
  fail "no PostgreSQL backup found in $BACKUP_DIR"
fi

printf '\n[Host health]\n'
root_usage="$(df -P / | awk 'NR==2 {gsub(/%/, "", $5); print $5}')"
printf 'Root filesystem usage: %s%%\n' "$root_usage"
if (( root_usage < 85 )); then
  pass "root filesystem usage is below 85%"
elif (( root_usage < 92 )); then
  warn "root filesystem usage is at least 85%"
else
  fail "root filesystem usage is at least 92%"
fi

zombies="$(ps -eo stat= | awk '$1 ~ /^Z/ {count++} END {print count+0}')"
printf 'Zombie processes: %s\n' "$zombies"
if (( zombies == 0 )); then
  pass "no zombie processes"
elif (( zombies <= 20 )); then
  warn "zombie processes present; inspect parent processes"
else
  fail "unusually high zombie-process count; investigate before final go-live"
fi

if [[ -f /var/run/reboot-required ]]; then
  warn "host reports reboot required"
else
  pass "host does not report reboot required"
fi

printf '\n[Summary]\n'
printf 'Failures: %d | Warnings: %d\n' "$failures" "$warnings"
if (( failures > 0 )); then
  printf 'PRODUCTION_PREFLIGHT=FAIL\n'
  exit 1
fi
printf 'PRODUCTION_PREFLIGHT=PASS\n'
