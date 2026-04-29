from fastapi import APIRouter
from app.core.database import get_db
from datetime import datetime, timezone

router = APIRouter()

@router.get("/")
async def get_stats():
    db = get_db()
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    # Get counts using "exact" to bypass any potential limit/caching issues
    total_jobs = db.table("crawl_jobs").select("id", count="exact").execute().count or 0
    active_jobs = db.table("crawl_jobs").select("id", count="exact").in_("status", ["pending", "running"]).execute().count or 0
    total_pages = db.table("crawled_pages").select("id", count="exact").execute().count or 0
    pages_today = db.table("crawled_pages").select("id", count="exact").gte("crawled_at", today_start).execute().count or 0
    
    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_pages_crawled": total_pages,
        "pages_today": pages_today,
        "debug_info": {"server_time_utc": datetime.now(timezone.utc).date().isoformat()}
    }
