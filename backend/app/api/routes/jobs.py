from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_db
from app.crawler.tasks import run_crawl_job
from pydantic import BaseModel
import uuid

router = APIRouter()

class JobCreate(BaseModel):
    domain: str
    max_pages: int = 100

# 1. Create a new crawl job
@router.post("/")
async def create_job(job: JobCreate):
    db = get_db()
    job_id = str(uuid.uuid4())
    job_record = {
        "id": job_id,
        "domain": job.domain,
        "max_pages": job.max_pages,
        "status": "pending"
    }
    db.table("crawl_jobs").insert(job_record).execute()
    run_crawl_job.delay(job_id, job.domain, max_pages=job.max_pages)
    return {"job_id": job_id, "status": "pending"}

# 2. List all jobs
@router.get("/")
async def list_jobs(limit: int = 100):
    db = get_db()
    response = db.table("crawl_jobs").select("*").order("created_at", desc=True).limit(limit).execute()
    return response.data

# 3. Get details of a single job
@router.get("/{job_id}")
async def get_job(job_id: str):
    db = get_db()
    response = db.table("crawl_jobs").select("*").eq("id", job_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return response.data[0]

# 4. NEW: Search pages within a job
@router.get("/{job_id}/search")
async def search_job_pages(job_id: str, q: str):
    db = get_db()
    # Case-insensitive search in title or body
    response = db.table("crawled_pages") \
        .select("url, title, word_count, crawled_at") \
        .eq("job_id", job_id) \
        .or_(f"title.ilike.%{q}%,body.ilike.%{q}%") \
        .execute()
    return response.data

# 5. NEW: Export all data for a job (including bodies)
@router.get("/{job_id}/export")
async def export_job_data(job_id: str):
    db = get_db()
    response = db.table("crawled_pages") \
        .select("url, title, body, word_count, crawled_at") \
        .eq("job_id", job_id) \
        .execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="No pages found for this job")
    
    return {
        "job_id": job_id,
        "total_pages": len(response.data),
        "pages": response.data
    }
