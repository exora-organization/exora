#!/bin/bash
set -e

APP_DIR="/var/www/exoratech-production/app"

LOG_DIR="/var/log/deploys"
LOG_FILE="$LOG_DIR/exora-production.log"

sudo mkdir -p "$LOG_DIR"
sudo chown "$(whoami):$(whoami)" "$LOG_DIR"

REF="${1:-main}"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

exec > >(tee -a "$LOG_FILE") 2>&1

echo ""
echo "===================================================="
echo "[$TIMESTAMP] Production Deploy Started"
echo "Branch : $REF"
echo "===================================================="

trap 'echo "[$(date "+%Y-%m-%d %H:%M:%S")] DEPLOY FAILED"; exit 1' ERR

cd "$APP_DIR"

echo ""
echo "Fetching latest source..."
git fetch origin
git checkout "$REF"
git pull origin "$REF"

echo ""
echo "Building Backend..."

cd backend

go mod download
go build -o exora-api ./cmd/api

echo ""
echo "Building Frontend..."

cd ../frontend

# Kill any stale next build process from a previous failed deploy
echo "Cleaning up stale build processes..."
pkill -f "next build" || true
sleep 2

# Clear cached build artifacts to avoid stale-lock conflicts
rm -rf .next

npm ci
npm run build

echo ""
echo "Restarting Backend..."
sudo systemctl restart exora-backend

echo "Restarting Frontend..."
sudo systemctl restart exora-frontend

echo ""
echo "Waiting services..."
sleep 3

echo ""
echo "Checking Backend..."

if curl -sf http://127.0.0.1:8080 >/dev/null; then
    echo "Backend OK"
else
    echo "WARNING: Backend health check failed"
fi

echo ""
echo "Checking Frontend..."

if curl -sf http://127.0.0.1:3000 >/dev/null; then
    echo "Frontend OK"
else
    echo "WARNING: Frontend health check failed"
fi

echo ""
echo "===================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Production Deploy SUCCESS"
echo "===================================================="