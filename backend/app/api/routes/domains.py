from fastapi import APIRouter
from app.core.database import get_db

router = APIRouter()

@router.get("/")
async def list_domains():
    db = get_db()
    res = db.table("crawl_jobs").select("domain, created_at, status").execute()
    domains = {}
    for job in (res.data or []):
        d = job["domain"]
        if d not in domains:
            domains[d] = {"domain": d, "total_jobs": 0, "last_crawled": None}
        domains[d]["total_jobs"] += 1
        if job["status"] == "completed":
            domains[d]["last_crawled"] = job["created_at"]
    return list(domains.values())
