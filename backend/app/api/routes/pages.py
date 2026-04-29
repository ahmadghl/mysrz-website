## pages.py
from fastapi import APIRouter, Query
from typing import Optional
from app.core.database import get_db

router = APIRouter()

@router.get("/")
async def list_pages(
    job_id: Optional[str] = None,
    search: Optional[str] = None,
    status_code: Optional[int] = None,
    limit: int = Query(100, le=1000),
    offset: int = 0,
):
    db = get_db()
    q = db.table("crawled_pages").select("*").order("crawled_at", desc=True).range(offset, offset + limit - 1)
    if job_id:
        q = q.eq("job_id", job_id)
    if status_code:
        q = q.eq("status_code", status_code)
    if search:
        q = q.ilike("url", f"%{search}%")
    return q.execute().data or []
