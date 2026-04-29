# SRZ Crawl – Deployment Guide

## Prerequisites
- Ubuntu 24.04 VPS (IP: 72.61.1.1) with n8n + Traefik already running on 80/443
- Python 3.11+, Redis, Tesseract OCR on the VPS
- Node.js 18+ locally for frontend
- Supabase account (central instance)
- Vercel account for frontend hosting

---

## 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Open **SQL Editor → New Query**
3. Paste and run `supabase_schema.sql`
4. Note your: **Project URL**, **Anon Key**, **Service Role Key**
5. Enable Email Auth in **Authentication → Providers**

---

## 2. VPS Backend Setup

SSH into your VPS:

```bash
ssh root@72.61.1.1
```

### Install system dependencies
```bash
apt update && apt install -y \
  python3.11 python3.11-venv python3-pip \
  redis-server tesseract-ocr \
  libtesseract-dev libleptonica-dev \
  build-essential libssl-dev

# Start Redis
systemctl enable redis-server && systemctl start redis-server

# Open firewall port (don't touch 80/443 — Traefik uses those)
ufw allow 3001/tcp
```

### Deploy backend
```bash
# Create directory structure
mkdir -p /opt/srz-crawl/{app,logs,backups}
mkdir -p /opt/srz-crawl/app/{auth,api,crawler,rag,utils,websocket,models}

# Upload all backend files (from your local machine):
# scp -r ./srz-crawl/backend/* root@72.61.1.1:/opt/srz-crawl/

# On VPS: configure environment
cd /opt/srz-crawl
cp .env.example .env
nano .env   # fill in all values

# Generate ENCRYPTION_KEY:
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Create virtualenv and install
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install Playwright browsers (for JS-heavy sites)
playwright install chromium

# Install systemd service
cp srz-crawl.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable srz-crawl
systemctl start srz-crawl

# Check status
systemctl status srz-crawl
journalctl -u srz-crawl -f

# Make scripts executable
chmod +x start.sh backup.sh

# Add backup cron (runs at 3am daily)
echo "0 3 * * * /opt/srz-crawl/backup.sh >> /opt/srz-crawl/logs/backup.log 2>&1" | crontab -
```

### Verify backend is running
```bash
curl http://localhost:3001/health
# Expected: {"status":"healthy","version":"1.0.0"}
```

---

## 3. Frontend Deployment (Vercel)

On your local machine:
```bash
cd srz-crawl/frontend

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Test locally
npm run dev
# Open http://localhost:3000

# Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod
```

### Vercel Environment Variables
Set these in your Vercel dashboard (Project → Settings → Environment Variables):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |
| `NEXT_PUBLIC_API_URL` | `http://72.61.1.1:3001` |
| `NEXT_PUBLIC_WS_URL` | `ws://72.61.1.1:3001` |

> **Note**: For production, put your backend behind Traefik with SSL:
> Add a Traefik label to route `crawl.yourdomain.com` → port 3001
> Then use `https://crawl.yourdomain.com` and `wss://crawl.yourdomain.com`

---

## 4. Backend .env Reference

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
ENCRYPTION_KEY=<generated-fernet-key>
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=https://srz-crawl.vercel.app,http://localhost:3000
WS_SECRET_KEY=<random-32-char-string>
TESSERACT_PATH=/usr/bin/tesseract
LOG_LEVEL=INFO
PORT=3001
```

---

## 5. Post-Deploy Checklist

- [ ] `curl http://72.61.1.1:3001/health` returns `{"status":"healthy"}`
- [ ] Frontend loads at Vercel URL
- [ ] Signup creates a user profile in Supabase
- [ ] Can add a domain on Dashboard
- [ ] Can start a crawl and see WebSocket progress
- [ ] Can chat after crawl completes (requires OpenAI key in Settings)
- [ ] n8n on ports 80/443 still works (check Traefik dashboard)

---

## 6. Traefik Integration (Optional SSL for Backend)

Add to your Traefik `docker-compose.yml` or dynamic config:

```yaml
# In your existing Traefik config, add a service + router for SRZ Crawl
http:
  routers:
    srz-crawl:
      rule: "Host(`crawl.yourdomain.com`)"
      service: srz-crawl
      tls:
        certResolver: letsencrypt
  services:
    srz-crawl:
      loadBalancer:
        servers:
          - url: "http://localhost:3001"
```

Then update Vercel env vars to use `https://` and `wss://`.

---

## 7. File Structure Reference

```
/opt/srz-crawl/
├── app/
│   ├── main.py                  # FastAPI entry point
│   ├── auth/middleware.py       # JWT verification + roles
│   ├── api/
│   │   ├── domains.py           # Domain CRUD
│   │   ├── crawl.py             # Start/stop/history
│   │   ├── schedules.py         # APScheduler integration
│   │   ├── chat.py              # RAG chat + file upload
│   │   ├── settings.py          # OpenAI key + prompt + subscription
│   │   ├── team.py              # Team member management
│   │   └── supabase_config.py   # Custom Supabase toggle
│   ├── crawler/
│   │   ├── spider.py            # Async web crawler (unlimited pages)
│   │   ├── scheduler.py         # APScheduler cron jobs
│   │   ├── queue_worker.py      # Redis-backed job queue
│   │   └── ocr.py               # Tesseract + OpenAI Vision
│   ├── rag/
│   │   ├── embeddings.py        # text-embedding-3-small chunks
│   │   ├── retriever.py         # pgvector cosine similarity search
│   │   └── chat_engine.py       # RAG response generation
│   ├── utils/
│   │   ├── encryption.py        # Fernet encrypt/decrypt
│   │   ├── limits.py            # Subscription tier enforcement
│   │   ├── dynamic_supabase.py  # Central vs. custom client factory
│   │   └── supabase_migration.py# Schema migration for custom instances
│   ├── websocket/progress.py    # WS real-time crawl progress
│   └── models/schemas.py        # All Pydantic models
├── requirements.txt
├── .env                         # ← YOU CREATE THIS
├── start.sh
├── backup.sh
└── logs/
```

---

## 8. Troubleshooting

**Backend won't start:**
```bash
journalctl -u srz-crawl -n 50
# Check for missing env vars or Python import errors
```

**CORS errors in browser:**
- Ensure `CORS_ORIGINS` in `.env` includes your Vercel domain exactly

**WebSocket won't connect:**
- Check port 3001 is open: `ufw status`
- Check backend logs for WS errors

**Crawl not generating embeddings:**
- Ensure user has added OpenAI API key in Settings
- Check OpenAI key has access to `text-embedding-3-small`

**pgvector search returning empty:**
- Confirm `vector` extension is enabled in Supabase
- Confirm `match_page_embeddings` function was created (check SQL Editor)
