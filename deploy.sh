#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  WebCrawler — VPS Backend Deploy Script
#  Deploys only the backend. Frontend is on Vercel.
#  Safe to run alongside existing n8n.
# ═══════════════════════════════════════════════════════════════

set -euo pipefail
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""; echo "  🕷  WebCrawler — Backend Deployment"; echo "  ─────────────────────────────────────"; echo ""

command -v docker >/dev/null 2>&1 || err "Docker not found."
COMPOSE="docker compose"
docker compose version >/dev/null 2>&1 || { command -v docker-compose >/dev/null 2>&1 || err "Docker Compose not found."; COMPOSE="docker-compose"; }
log "Docker + Compose ready"

for port in 8000; do
  ss -tlnp | grep -q ":$port " && warn "Port $port already in use" || log "Port $port is free"
done

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  warn "Created backend/.env — fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, SECRET_KEY, CORS_ORIGINS then re-run."
  exit 1
fi
log "backend/.env found"

source backend/.env
[ -z "${SUPABASE_URL:-}"         ] && err "SUPABASE_URL not set in backend/.env"
[ -z "${SUPABASE_SERVICE_KEY:-}" ] && err "SUPABASE_SERVICE_KEY not set in backend/.env"
log "Environment validated"

log "Building images..."
$COMPOSE build

log "Starting services..."
$COMPOSE up -d

log "Waiting for API health..."
sleep 5; MAX=60; WAITED=0
until curl -sf http://localhost:8000/health >/dev/null 2>&1; do
  sleep 2; WAITED=$((WAITED+2))
  [ $WAITED -ge $MAX ] && err "API not healthy. Check: docker logs crawler_api"
done
log "API is healthy"

if command -v nginx >/dev/null 2>&1; then
  cp nginx/webcrawler-api.nginx.conf /etc/nginx/sites-available/webcrawler-api
  [ ! -L /etc/nginx/sites-enabled/webcrawler-api ] && ln -s /etc/nginx/sites-available/webcrawler-api /etc/nginx/sites-enabled/webcrawler-api
  nginx -t && systemctl reload nginx
  log "Nginx configured"
else
  warn "Nginx not found — configure reverse proxy manually"
fi

VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_VPS_IP")
echo ""
echo "  ═══════════════════════════════════════════════════"
echo "  Backend deployed! Next steps:"
echo "  1. Run supabase_schema.sql in Supabase SQL editor"
echo "  2. certbot --nginx -d api.yourdomain.com"
echo "  3. Deploy frontend to Vercel (see README)"
echo "  4. In Vercel dashboard: VITE_API_URL=https://api.yourdomain.com"
echo "  5. Add your Vercel URL to CORS_ORIGINS in backend/.env"
echo "     then: docker compose restart crawler_api"
echo "  API docs: http://${VPS_IP}:8000/docs"
echo ""
