"""
Daily crawl task: fetches all enabled url_targets, launches a crawl
job for each, then triggers embedding once each job completes.
Scheduled via Celery Beat to run every morning at 6:00 AM UTC.
"""
import asyncio
import uuid
from datetime import datetime, timezone
from loguru import logger

from app.core.celery_app import celery_app
from app.core.database import get_db
from app.schemas.schemas import JobStatus, CrawlMode
from app.crawler.engine import CrawlEngine, CrawlResult
from app.core.config import settings


def _utcnow():
    return datetime.now(timezone.utc).isoformat()


@celery_app.task(name="app.crawler.daily_tasks.run_daily_crawl", bind=True)
def run_daily_crawl(self):
    """
    Main daily task:
    1. Load all enabled url_targets
    2. For each target, create a crawl_job and run it
    3. After each job, trigger embedding
    """
    asyncio.run(_run_daily_crawl_async())


async def _run_daily_crawl_async():
    db = get_db()
    targets = db.table("url_targets") \
        .select("*") \
        .eq("enabled", True) \
        .execute().data or []

    if not targets:
        logger.info("Daily crawl: no enabled targets found.")
        return

    logger.info(f"Daily crawl starting: {len(targets)} targets")

    for target in targets:
        job_id = str(uuid.uuid4())
        domain = target["url"]

        # Create job record
        db.table("crawl_jobs").insert({
            "id":                  job_id,
            "domain":              domain,
            "name":                f"Daily — {target.get('label', domain)}",
            "status":              JobStatus.pending,
            "mode":                target.get("crawl_mode", "auto"),
            "max_pages":           target.get("max_pages") or settings.MAX_PAGES_PER_DOMAIN,
            "crawl_delay":         settings.DEFAULT_CRAWL_DELAY,
            "respect_robots_txt":  True,
            "follow_external_links": False,
            "pages_crawled":       0,
            "pages_failed":        0,
            "bytes_downloaded":    0,
            "created_at":          _utcnow(),
            "updated_at":          _utcnow(),
        }).execute()

        # Update target's last_job_id
        db.table("url_targets").update({
            "last_job_id":      job_id,
            "last_crawled_at":  _utcnow(),
            "updated_at":       _utcnow(),
        }).eq("id", target["id"]).execute()

        logger.info(f"Crawling {domain} (job {job_id})")

        try:
            await _crawl_and_embed(job_id, target)
        except Exception as e:
            logger.error(f"Failed crawl for {domain}: {e}")
            db.table("crawl_jobs").update({
                "status":        JobStatus.failed,
                "error_message": str(e)[:1000],
                "completed_at":  _utcnow(),
                "updated_at":    _utcnow(),
            }).eq("id", job_id).execute()


async def _crawl_and_embed(job_id: str, target: dict):
    from app.services.embeddings import embed_and_store_page

    db = get_db()
    domain = target["url"]

    # Mark running
    db.table("crawl_jobs").update({
        "status":     JobStatus.running,
        "started_at": _utcnow(),
        "updated_at": _utcnow(),
    }).eq("id", job_id).execute()

    page_buffer = []
    BUFFER_SIZE = 50
    pages_crawled = 0
    pages_failed = 0
    bytes_downloaded = 0

    async def on_page_crawled(result: CrawlResult):
        nonlocal pages_crawled, pages_failed, bytes_downloaded, page_buffer

        page_id = str(uuid.uuid4())
        record = {
            "id":           page_id,
            "job_id":       job_id,
            "url":          result.url[:2000],
            "title":        (result.title or "")[:500],
            "status_code":  result.status_code,
            "content_type": (result.content_type or "")[:100],
            "word_count":   result.word_count,
            "links_found":  len(result.links),
            "depth":        result.depth,
            "load_time_ms": result.load_time_ms,
            "error":        result.error,
            "body":         result.text[:50000] if result.text else "",   # store text for embedding
            "crawled_at":   _utcnow(),
        }

        if result.error:
            pages_failed += 1
        else:
            pages_crawled += 1
            bytes_downloaded += len(result.html.encode("utf-8", errors="ignore"))

        page_buffer.append(record)

        # Flush + embed in batches
        if len(page_buffer) >= BUFFER_SIZE:
            await _flush_and_embed(db, job_id, page_buffer)
            page_buffer.clear()

        # Progress update
        db.table("crawl_jobs").update({
            "pages_crawled":    pages_crawled,
            "pages_failed":     pages_failed,
            "bytes_downloaded": bytes_downloaded,
            "updated_at":       _utcnow(),
        }).eq("id", job_id).execute()

    engine = CrawlEngine(
        job_id=job_id,
        domain=domain,
        mode=CrawlMode(target.get("crawl_mode", "auto")),
        max_pages=target.get("max_pages") or settings.MAX_PAGES_PER_DOMAIN,
        crawl_delay=settings.DEFAULT_CRAWL_DELAY,
        respect_robots=True,
        on_page_crawled=on_page_crawled,
    )

    await engine.run()

    # Flush remaining
    if page_buffer:
        await _flush_and_embed(db, job_id, page_buffer)

    # Mark complete
    db.table("crawl_jobs").update({
        "status":           JobStatus.completed,
        "pages_crawled":    pages_crawled,
        "pages_failed":     pages_failed,
        "bytes_downloaded": bytes_downloaded,
        "completed_at":     _utcnow(),
        "updated_at":       _utcnow(),
    }).eq("id", job_id).execute()

    logger.info(f"Daily crawl complete: {domain} — {pages_crawled} pages")


async def _flush_and_embed(db, job_id: str, pages: list):
    """Insert pages into DB and embed their text content."""
    from app.services.embeddings import embed_and_store_page

    try:
        # Remove body from page record before insert (store separately for embedding)
        page_records = [{k: v for k, v in p.items() if k != "body"} for p in pages]
        db.table("crawled_pages").insert(page_records).execute()
    except Exception as e:
        logger.error(f"Page flush failed: {e}")
        return

    # Embed each page
    for page in pages:
        if page.get("error") or not page.get("body"):
            continue
        if (page.get("word_count") or 0) < 50:
            continue
        try:
            await embed_and_store_page(
                page_id=page["id"],
                job_id=job_id,
                url=page["url"],
                title=page.get("title", ""),
                text=page["body"],
            )
        except Exception as e:
            logger.error(f"Embedding failed for {page['url']}: {e}")
