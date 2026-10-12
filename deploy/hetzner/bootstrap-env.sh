#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-/opt/roblox-decision-engine}"
ENV_FILE="$ROOT_DIR/.env.production"
DATA_DIR="/mnt/HC_Volume_106874499/rde"

if [[ -e "$ENV_FILE" ]]; then
  echo "Refusing to overwrite existing $ENV_FILE"
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
CORS_ORIGINS=http://127.0.0.1:8090
NEXT_PUBLIC_API_URL=http://127.0.0.1:8091
PILOT_ADMIN_TOKEN=$PILOT_ADMIN_TOKEN
PILOT_CREDENTIAL_KEY=$PILOT_CREDENTIAL_KEY
PILOT_SESSION_HOURS=840
PILOT_INVITE_HOURS=72
ADMIN_DASHBOARD_USERNAME=$ADMIN_USER
ADMIN_DASHBOARD_PASSWORD=$ADMIN_PASSWORD
ADMIN_SESSION_SECRET=$ADMIN_SESSION_SECRET
OPENAI_API_KEY=
OPENAI_API_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-6-luna
ROBLOX_ANALYTICS_BASE_URL=https://apis.roblox.com/analytics-query-api
WRITE_RATE_LIMIT_PER_MINUTE=60
EOF

chmod 600 "$ENV_FILE"
echo "Created $ENV_FILE with mode 600."
echo "Admin username: $ADMIN_USER"
echo "Admin password was not printed. Store it in your password manager."
