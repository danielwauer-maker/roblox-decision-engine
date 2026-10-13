#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-/opt/roblox-decision-engine}"
ENV_FILE="$ROOT_DIR/.env.production"
DATA_DIR="/mnt/HC_Volume_106874499/rde"

if [[ -e "$ENV_FILE" ]]; then
  echo "Refusing to overwrite existing $ENV_FILE"
  echo "For an existing installation, add only the missing R16 variables manually."
  exit 1
fi

rand_hex() { openssl rand -hex 32; }
fernet_key() { openssl rand -base64 32 | tr '+/' '-_' | tr -d '\n'; }

read -r -p "Admin username [operator]: " ADMIN_USER
ADMIN_USER="${ADMIN_USER:-operator}"
read -r -s -p "Admin password: " ADMIN_PASSWORD
echo
read -r -s -p "Repeat admin password: " ADMIN_PASSWORD_2
echo

if [[ -z "$ADMIN_PASSWORD" || "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_2" ]]; then
  echo "Passwords are empty or do not match."
  exit 1
fi

POSTGRES_PASSWORD="$(rand_hex)"
PILOT_ADMIN_TOKEN="$(rand_hex)"
PILOT_CREDENTIAL_KEY="$(fernet_key)"
ADMIN_SESSION_SECRET="$(rand_hex)"

umask 077
cat > "$ENV_FILE" <<EOF
RDE_DATA_DIR=$DATA_DIR
POSTGRES_DB=roblox_decision_engine
POSTGRES_USER=rde
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
PUBLIC_APP_URL=https://playdirective.com
CORS_ORIGINS=https://playdirective.com
NEXT_PUBLIC_API_URL=http://127.0.0.1:8091
PILOT_ADMIN_TOKEN=$PILOT_ADMIN_TOKEN
PILOT_CREDENTIAL_KEY=$PILOT_CREDENTIAL_KEY
PILOT_SESSION_HOURS=840
PILOT_INVITE_HOURS=72
PILOT_LOGIN_LINK_MINUTES=20
ADMIN_DASHBOARD_USERNAME=$ADMIN_USER
ADMIN_DASHBOARD_PASSWORD=$ADMIN_PASSWORD
ADMIN_SESSION_SECRET=$ADMIN_SESSION_SECRET
LEGAL_OPERATOR_NAME=
LEGAL_STREET_ADDRESS=
LEGAL_POSTAL_CITY=
LEGAL_COUNTRY=Germany
LEGAL_EMAIL=
LEGAL_ADDITIONAL_DETAILS=
OPENAI_API_KEY=
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-6-luna
ROBLOX_ANALYTICS_BASE_URL=https://apis.roblox.com/analytics-query-api
WRITE_RATE_LIMIT_PER_MINUTE=60
RESEND_API_KEY=
EMAIL_FROM=PlayDirective <pilot@playdirective.com>
OPERATOR_EMAIL=
LIFECYCLE_STALE_DAYS=7
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_INDIE=
STRIPE_PRICE_GROWTH=
STRIPE_PRICE_STUDIO=
STRIPE_WEBHOOK_TOLERANCE_SECONDS=300
EOF

chmod 600 "$ENV_FILE"
echo "Created $ENV_FILE with mode 600."
echo "Admin username: $ADMIN_USER"
echo "Admin password and generated secrets were not printed. Store credentials in your password manager."
echo "Before production acceptance, add OpenAI, Resend and Stripe provider secrets directly to $ENV_FILE."
