# /opt/srz-crawl/app/crawler/queue_worker.py
"""
Background task queue: processes one crawl job at a time per user.
Uses Redis for job state and asyncio for concurrency.
"""
import asyncio
import json
import os
from typing import Dict, Optional
from loguru import logger
import redis.asyncio as aioredis

_redis: Optional[aioredis.Redis] = None
_active_jobs: Dict[str, asyncio.Task] = {}  # job_id -> Task
_job_progress: Dict[str, dict] = {}  # job_id -> progress dict


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = await aioredis.from_url(
            os.getenv("REDIS_URL", "redis://localhost:6379"),
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis


async def update_job_progress(job_id: str, progress: dict):
    """Update job progress in Redis and in-memory cache."""
    _job_progress[job_id] = progress
    try:
        r = await get_redis()
        await r.setex(f"crawl:progress:{job_id}", 3600, json.dumps(progress))
    except Exception as e:
        logger.warning(f"Redis update failed: {e}")


async def get_job_progress(job_id: str) -> Optional[dict]:
    """Get current progress for a job."""
    if job_id in _job_progress:
        return _job_progress[job_id]
    try:
        r = await get_redis()
        data = await r.get(f"crawl:progress:{job_id}")
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None


async def enqueue_crawl(
    user_id: str,
    job_id: str,
    domain_ids: list,
    openai_api_key: Optional[str] = None,
) -> str:
    """Add a crawl job to the queue and start if no active job."""
    try:
        r = await get_redis()
        job = {
            "job_id": job_id,
            "user_id": user_id,
            "domain_ids": domain_ids,
            "openai_api_key": openai_api_key,
        }
        await r.lpush(f"crawl:queue:{user_id}", json.dumps(job))
        logger.info(f"Enqueued crawl job {job_id} for user {user_id}")

        # Start processing if not already running
        if user_id not in _active_jobs or _active_jobs[user_id].done():
            asyncio.create_task(_process_queue(user_id))

        return job_id
    except Exception as e:
        logger.error(f"Error enqueuing crawl: {e}")
        raise


async def _process_queue(user_id: str):
    """Process the crawl queue for a user (one at a time)."""
    from app.crawler.spider import CrawlSpider
    from app.utils.dynamic_supabase import get_supabase_client_for_user

    try:
        r = await get_redis()
        while True:
            job_data = await r.rpop(f"crawl:queue:{user_id}")
            if not job_data:
                break

            job = json.loads(job_data)
            job_id = job["job_id"]
            domain_ids = job["domain_ids"]
            openai_key = job.get("openai_api_key")

            logger.info(f"Processing crawl job {job_id}")

            # Update DB status
            supabase = await get_supabase_client_for_user(user_id)
            supabase.table("crawl_queue").update({
                "status": "running",
                "started_at": "now()",
            }).eq("id", job_id).execute()

            # Crawl each domain
            for domain_id in domain_ids:
                try:
                    domain_result = (
                        supabase.table("domains")
                        .select("url")
                        .eq("id", domain_id)
                        .single()
                        .execute()
                    )
                    if not domain_result.data:
                        continue

                    domain_url = domain_result.data["url"]

                    supabase.table("domains").update({"status": "crawling"}).eq("id", domain_id).execute()

                    spider = CrawlSpider(
                        user_id=user_id,
                        domain_id=domain_id,
                        start_url=domain_url,
                        job_id=job_id,
                        openai_api_key=openai_key,
                    )

                    # Store spider for stop capability
                    _active_jobs[job_id] = asyncio.current_task()

                    await spider.run()

                except Exception as e:
                    logger.error(f"Domain crawl failed {domain_id}: {e}")
                    supabase.table("domains").update({"status": "error"}).eq("id", domain_id).execute()

            # Mark job complete
            supabase.table("crawl_queue").update({
                "status": "completed",
                "completed_at": "now()",
            }).eq("id", job_id).execute()

            logger.info(f"Crawl job {job_id} completed")

    except Exception as e:
        logger.error(f"Queue processor error for user {user_id}: {e}")


async def stop_job(job_id: str) -> bool:
    """Stop an active crawl job."""
    if job_id in _active_jobs:
        task = _active_jobs[job_id]
        if not task.done():
            task.cancel()
            logger.info(f"Stopped crawl job {job_id}")
            return True
    return False
