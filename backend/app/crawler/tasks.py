from app.core.celery_app import celery_app
from app.core.database import get_db
from app.crawler.engine import CrawlEngine
import asyncio

@celery_app.task(name="app.crawler.tasks.run_crawl_job")
def run_crawl_job(job_id, url, *args, **kwargs):
    db = get_db()
    
    async def _run():
        async def on_page(result):
            # SAVE INDIVIDUAL PAGE DATA
            db.table("crawled_pages").insert({
                "job_id": job_id,
                "url": result.url,
                "title": result.title,
                "status_code": result.status_code,
                "content_type": result.content_type,
                "word_count": result.word_count,
                "links_found": len(result.links),
                "depth": result.depth,
                "load_time_ms": result.load_time_ms,
                "error": result.error,
                "bytes_downloaded": getattr(result, 'bytes_downloaded', 0)
            }).execute()

        engine = CrawlEngine(job_id=job_id, domain=url, on_page_crawled=on_page, **kwargs)
        await engine.run()
        
        # UPDATE THE MAIN JOB SUMMARY
        db.table("crawl_jobs").update({
            "status": "completed",
            "pages_crawled": engine.pages_crawled,
            "bytes_downloaded": engine.bytes_downloaded
        }).eq("id", job_id).execute()

    asyncio.run(_run())
