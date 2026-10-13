#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/roblox-decision-engine}"
CRON_FILE="/etc/cron.d/playdirective-r17"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root (or with sudo) so /etc/cron.d can be updated." >&2
  exit 1
fi

cat > "$CRON_FILE" <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Daily transactional/lifecycle evaluation at 08:10 server time.
10 8 * * * root $APP_DIR/deploy/hetzner/r17-lifecycle.sh >> /var/log/playdirective-r17-lifecycle.log 2>&1

# Daily PostgreSQL backup at 02:20 server time.
20 2 * * * root $APP_DIR/deploy/hetzner/backup-postgres.sh >> /var/log/playdirective-backup.log 2>&1

# Local production health check every 5 minutes.
*/5 * * * * root $APP_DIR/deploy/hetzner/healthcheck.sh >> /var/log/playdirective-health.log 2>&1
EOF

chmod 644 "$CRON_FILE"
chmod +x \
  "$APP_DIR/deploy/hetzner/r17-lifecycle.sh" \
  "$APP_DIR/deploy/hetzner/backup-postgres.sh" \
  "$APP_DIR/deploy/hetzner/healthcheck.sh"

echo "Installed $CRON_FILE"
echo "Note: healthcheck failures are logged locally. Configure an external uptime monitor for independent alerting."
