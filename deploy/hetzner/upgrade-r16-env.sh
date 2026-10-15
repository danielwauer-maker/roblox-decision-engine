#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-/opt/roblox-decision-engine}"
ENV_FILE="$ROOT_DIR/.env.production"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "For a new installation, use deploy/hetzner/bootstrap-env.sh instead."
  exit 1
fi

append_if_missing() {
  local key="$1"
  local value="$2"
  if ! grep -qE "^${key}=" "$ENV_FILE"; then
    printf '%s=%s\n' "$key" "$value" >> "$ENV_FILE"
    echo "Added $key"
  else
    echo "Kept existing $key"
  fi
}

umask 077

append_if_missing "PUBLIC_APP_URL" "https://playdirective.com"
append_if_missing "CORS_ORIGINS" "https://playdirective.com"
append_if_missing "NEXT_PUBLIC_API_URL" "http://127.0.0.1:8091"
append_if_missing "PILOT_LOGIN_LINK_MINUTES" "20"
append_if_missing "RESEND_API_KEY" ""
append_if_missing "EMAIL_FROM" "PlayDirective <pilot@playdirective.com>"
append_if_missing "OPERATOR_EMAIL" ""
append_if_missing "LIFECYCLE_STALE_DAYS" "7"
append_if_missing "STRIPE_SECRET_KEY" ""
append_if_missing "STRIPE_MODE" "live"
append_if_missing "STRIPE_TEST_BILLING_MODE" "false"
append_if_missing "STRIPE_MANAGED_PAYMENTS_ENABLED" "false"
append_if_missing "STRIPE_WEBHOOK_SECRET" ""
append_if_missing "STRIPE_PORTAL_CONFIGURATION_ID" ""
append_if_missing "STRIPE_PRICE_INDIE_PERSONAL" ""
append_if_missing "STRIPE_PRICE_INDIE_BUSINESS" ""
append_if_missing "STRIPE_PRICE_GROWTH_PERSONAL" ""
append_if_missing "STRIPE_PRICE_GROWTH_BUSINESS" ""
append_if_missing "STRIPE_PRICE_STUDIO_PERSONAL" ""
append_if_missing "STRIPE_PRICE_STUDIO_BUSINESS" ""
append_if_missing "STRIPE_WEBHOOK_TOLERANCE_SECONDS" "300"

chmod 600 "$ENV_FILE"

echo
echo "R16 environment upgrade complete. Existing values were never overwritten."
echo "Next: edit $ENV_FILE and fill RESEND_API_KEY, OPERATOR_EMAIL and Stripe TEST MODE values when available."
echo "Do not paste provider secrets into source control or shell history."
