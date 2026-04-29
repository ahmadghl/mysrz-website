# /opt/srz-crawl/app/api/crawl.py
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from loguru import logger

from app.auth.middleware import get_current_user, CurrentUser, require_editor
from app.models.schemas import CrawlStartRequest, CrawlProgress, CrawlHistoryResponse
from app.utils.dynamic_supabase import get_supabase_client_for_user
from app.utils.limits import check_crawl_limit
from app.utils.encryption import decrypt
from app.crawler.queue_worker import enqueue_crawl, get_job_progress, stop_job

router = APIRouter()


async def _get_openai_key(user_id: str) -> Optional[str]:
    try:
        supabase = await get_supabase_client_for_user(user_id)
        result = (
            supabase.table("user_openai_keys")
            .select("api_key_encrypted")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if result.data:
            return decrypt(result.data["api_key_encrypted"])
    except Exception as e:
        logger.warning(f"Could not load OpenAI key: {e}")
    return None


@router.post("/start")
async def start_crawl(
    data: CrawlStartRequest,
    current_user: CurrentUser = Depends(require_editor),
):
    await check_crawl_limit(current_user.user_id)
    supabase = await get_supabase_client_for_user(current_user.user_id)

    # Determine which domains to crawl
    if data.domain_ids:
        domain_ids = data.domain_ids
    else:
        # Use selected domains
        result = (
            supabase.table("domains")
            .select("id")
            .eq("user_id", current_user.user_id)
            .eq("is_selected", True)
            .execute()
        )
        domain_ids = [d["id"] for d in (result.data or [])]

    if not domain_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No domains selected. Please select at least one domain.",
        )

    job_id = str(uuid.uuid4())
    openai_key = await _get_openai_key(current_user.user_id)

    # Create crawl queue record
    supabase.table("crawl_queue").insert({
        "id": job_id,
        "user_id": current_user.user_id,
        "domain_ids": domain_ids,
        "status": "pending",
    }).execute()

    # Enqueue
    await enqueue_crawl(
        user_id=current_user.user_id,
        job_id=job_id,
        domain_ids=domain_ids,
        openai_api_key=openai_key,
    )

    return {"job_id": job_id, "status": "queued", "domain_count": len(domain_ids)}


@router.post("/stop/{job_id}")
async def stop_crawl(
    job_id: str,
    current_user: CurrentUser = Depends(require_editor),
):
    stopped = await stop_job(job_id)
    if not stopped:
        raise HTTPException(status_code=404, detail="No active crawl found with this job ID")

    supabase = await get_supabase_client_for_user(current_user.user_id)
    supabase.table("crawl_queue").update({
        "status": "stopped",
        "completed_at": "now()",
    }).eq("id", job_id).eq("user_id", current_user.user_id).execute()

    return {"job_id": job_id, "status": "stopped"}


@router.get("/status/{job_id}")
async def get_crawl_status(
    job_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    progress = await get_job_progress(job_id)
    if not progress:
        # Fall back to DB
        supabase = await get_supabase_client_for_user(current_user.user_id)
        result = (
            supabase.table("crawl_queue")
            .select("*")
            .eq("id", job_id)
            .eq("user_id", current_user.user_id)
            .maybe_single()
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Job not found")
        return result.data
    return progress


@router.get("/history", response_model=List[CrawlHistoryResponse])
async def get_crawl_history(
    current_user: CurrentUser = Depends(get_current_user),
    limit: int = 20,
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("crawl_queue")
        .select("*, domains(url)")
        .eq("user_id", current_user.user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    rows = result.data or []
    return [
        {
            "id": r["id"],
            "domain_id": r.get("domain_ids", [None])[0],
            "domain_url": (r.get("domains") or {}).get("url", "Multiple"),
            "status": r["status"],
            "pages_crawled": r.get("pages_crawled", 0),
            "started_at": r.get("started_at") or r["created_at"],
            "completed_at": r.get("completed_at"),
            "error": r.get("error"),
        }
        for r in rows
    ]
