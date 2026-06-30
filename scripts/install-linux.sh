#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-nexai20x}"
APP_DIR="${APP_DIR:-/opt/nexai20x}"
DOMAIN="${DOMAIN:-}"
PORT="${PORT:-4173}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"
DATA_STORE="${DATA_STORE:-sqlite}"
SQLITE_PATH="${SQLITE_PATH:-$APP_DIR/data/app.sqlite}"

if [[ $EUID -ne 0 ]]; then
  echo "Please run as root: sudo bash scripts/install-linux.sh"
  exit 1
fi

if [[ -z "$ADMIN_PASSWORD" ]]; then
  ADMIN_PASSWORD="$(openssl rand -base64 24 | tr -d '=+/')"
fi

ADMIN_SESSION_SECRET="${ADMIN_SESSION_SECRET:-$(openssl rand -base64 48 | tr -d '=+/')}"

echo "==> Installing system packages"
apt-get update
apt-get install -y ca-certificates curl gnupg build-essential python3 make g++ sqlite3 rsync

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -Eq '^v20|^v22'; then
  echo "==> Installing Node.js 20"
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2"
  npm install -g pm2
fi

if ! command -v caddy >/dev/null 2>&1; then
  echo "==> Installing Caddy"
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update
  apt-get install -y caddy
fi

echo "==> Preparing app directory: $APP_DIR"
mkdir -p "$APP_DIR"
rsync -a --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  ./ "$APP_DIR/"

cd "$APP_DIR"
mkdir -p data logs backups

if [[ ! -f .env ]]; then
  cat > .env <<EOF
NODE_ENV=production
HOST=127.0.0.1
PORT=$PORT

DATA_STORE=$DATA_STORE
SQLITE_PATH=$SQLITE_PATH

ADMIN_USERNAME=$ADMIN_USERNAME
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_SESSION_SECRET=$ADMIN_SESSION_SECRET

PAYMENT_MODE=mock

ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
ALIPAY_NOTIFY_URL=

WECHAT_MCH_ID=
WECHAT_APP_ID=
WECHAT_API_V3_KEY=
WECHAT_PRIVATE_KEY=
WECHAT_SERIAL_NO=
WECHAT_PLATFORM_PUBLIC_KEY=
WECHAT_NOTIFY_URL=

USDT_BEP20_ADDRESS=
EOF
fi

echo "==> Installing app dependencies"
npm ci --omit=dev

echo "==> Starting app with PM2"
pm2 start server.js --name "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env
pm2 save
pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.txt || true

if [[ -n "$DOMAIN" ]]; then
  echo "==> Writing Caddy config for $DOMAIN"
  cat > /etc/caddy/Caddyfile <<EOF
$DOMAIN {
  encode gzip zstd
  reverse_proxy 127.0.0.1:$PORT
}
EOF
  systemctl enable caddy
  systemctl reload caddy || systemctl restart caddy
else
  echo "==> DOMAIN is empty. Skipping Caddy site config."
fi

cat > "$APP_DIR/backup.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="$APP_DIR/backups"
mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/nexai20x-$(date +%F-%H%M%S).tar.gz" \
  -C "$APP_DIR" data assets .env
find "$BACKUP_DIR" -type f -name 'nexai20x-*.tar.gz' -mtime +14 -delete
EOF
chmod +x "$APP_DIR/backup.sh"

echo
echo "Deploy complete."
echo "App dir: $APP_DIR"
echo "PM2 app: $APP_NAME"
echo "Admin path: /father"
echo "Admin username: $ADMIN_USERNAME"
echo "Admin password: $ADMIN_PASSWORD"
echo "Data store: $DATA_STORE"
echo "SQLite path: $SQLITE_PATH"
echo
echo "Useful commands:"
echo "  pm2 status"
echo "  pm2 logs $APP_NAME"
echo "  pm2 restart $APP_NAME --update-env"
echo "  bash $APP_DIR/backup.sh"
