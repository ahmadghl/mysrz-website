# 🕷 WebCrawler

A production-grade web crawling platform. Multi-domain, async, scalable.

| Layer | Tech | Hosted on |
|---|---|---|
| Frontend | React + TypeScript + Tailwind | **Vercel** |
| Backend API | FastAPI + Python | **VPS (Docker)** |
| Task Queue | Celery + Redis | **VPS (Docker)** |
| Database | Supabase (PostgreSQL) | **Supabase cloud** |

---

## Repository Structure

```
webcrawler/
├── frontend/               ← React app → deployed to Vercel
│   ├── src/
│   │   ├── pages/          ← Dashboard, Jobs, JobDetail, Pages, Domains, Login
│   │   ├── components/     ← Layout, StatusBadge
│   │   ├── store/          ← Zustand auth store
│   │   └── lib/            ← Axios API client + wsUrl helper
│   ├── vercel.json         ← Vercel build config + SPA rewrites
│   └── .env.example
│
├── backend/                ← FastAPI app → deployed to VPS via Docker
│   ├── app/
│   │   ├── api/routes/     ← jobs, pages, domains, stats, auth, health
│   │   ├── core/           ← config, database, celery, websocket manager
│   │   ├── crawler/        ← engine (Scrapy + Playwright), Celery tasks
│   │   └── schemas/        ← Pydantic models
│   ├── Dockerfile
│   └── .env.example
│
├── nginx/                  ← Nginx reverse proxy config (API only)
├── .github/workflows/      ← CI: build + type-check on every push
├── docker-compose.yml      ← Backend services (Redis, API, Worker, Beat, Flower)
├── supabase_schema.sql     ← Run once in Supabase SQL editor
├── deploy.sh               ← One-command VPS deploy
└── manage.sh               ← Day-to-day operations
```

---

## Deployment Guide

### 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/webcrawler.git
git push -u origin main
```

---

### 2 — Supabase (database)

1. Open your [Supabase](https://supabase.com) project → **SQL Editor**
2. Paste and run the full contents of `supabase_schema.sql`
3. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

---

### 3 — VPS (backend)

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Clone your repo
git clone https://github.com/YOUR_USERNAME/webcrawler.git
cd webcrawler

# Configure
cp backend/.env.example backend/.env
nano backend/.env
```

Required fields in `backend/.env`:

```env
SECRET_KEY=           # generate: openssl rand -hex 32
SUPABASE_URL=         # https://xxxx.supabase.co
SUPABASE_SERVICE_KEY= # your service_role key
CORS_ORIGINS=["https://your-app.vercel.app"]
```

Then deploy:

```bash
chmod +x deploy.sh manage.sh
sudo bash deploy.sh
```

Add SSL:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

---

### 4 — Vercel (frontend)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** → `frontend`
4. Add environment variable:
   - `VITE_API_URL` = `https://api.yourdomain.com`
5. Click **Deploy**

After deploy, add your Vercel URL to CORS on the VPS:

```bash
# Edit backend/.env
CORS_ORIGINS=["https://your-app.vercel.app","https://crawler.yourdomain.com"]

# Restart API to apply
docker compose restart crawler_api
```

---

## Local Development

```bash
# Terminal 1 — Backend API
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in Supabase keys
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Celery worker
source backend/.venv/bin/activate
celery -A app.core.celery_app worker --loglevel=info

# Terminal 3 — Frontend
cd frontend
cp .env.example .env.local  # set VITE_API_URL=http://localhost:8000
npm install
npm run dev                 # opens http://localhost:5173
```

---

## VPS Management

```bash
bash manage.sh start               # Start all backend services
bash manage.sh stop                # Stop crawler (n8n stays running)
bash manage.sh logs crawler_api    # Tail API logs
bash manage.sh logs crawler_worker # Tail worker logs
bash manage.sh status              # Show all containers + health
bash manage.sh scale 4             # Scale to 4 Celery workers
bash manage.sh shell crawler_api   # Open shell inside container
bash manage.sh backup              # Backup Redis to ./backups/
bash manage.sh update              # git pull + rebuild + restart
```

---

## API Reference

Base URL: `https://api.yourdomain.com/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Get JWT token |
| `GET` | `/jobs` | List all crawl jobs |
| `POST` | `/jobs` | Create + start new crawl |
| `GET` | `/jobs/{id}` | Get job detail |
| `PATCH` | `/jobs/{id}` | Update job |
| `POST` | `/jobs/{id}/pause` | Pause job |
| `POST` | `/jobs/{id}/resume` | Resume job |
| `POST` | `/jobs/{id}/cancel` | Cancel job |
| `DELETE` | `/jobs/{id}` | Delete job + all pages |
| `GET` | `/jobs/{id}/export` | Download pages as CSV |
| `GET` | `/pages` | Browse all crawled pages |
| `GET` | `/domains` | List crawled domains |
| `GET` | `/stats` | Global stats |
| `GET` | `/health` | Health check |
| `WS` | `/ws/{job_id}` | Live crawl updates |

Interactive Swagger docs: `https://api.yourdomain.com/docs`

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | ✅ | JWT signing secret (64 char random string) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Supabase service role key |
| `CORS_ORIGINS` | ✅ | JSON array — include your Vercel URL |
| `DEFAULT_CRAWL_DELAY` | — | Seconds between requests (default: 1.0) |
| `MAX_PAGES_PER_DOMAIN` | — | Page cap per job (default: 10000) |
| `MAX_CONCURRENT_CRAWLS` | — | Parallel jobs (default: 5) |

### Frontend — Vercel Dashboard

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your VPS API URL: `https://api.yourdomain.com` |

---

## n8n Coexistence

Completely isolated from your existing n8n instance:

- Separate `docker-compose.yml` with its own lifecycle
- Separate Docker network: `crawler_network` (not `n8n_default`)
- Different ports: API `8000`, n8n `5678`
- Separate Nginx config: `/etc/nginx/sites-available/webcrawler-api`
- No shared volumes or environment

Stopping the crawler never touches n8n:
```bash
bash manage.sh stop
```

---

## Default Login

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `changeme123` |

To set a new password hash:
```bash
python -c "from passlib.context import CryptContext; print(CryptContext(['bcrypt']).hash('your-new-password'))"
```
Then update `ADMIN_PASSWORD_HASH` in `backend/app/api/routes/auth.py`.
