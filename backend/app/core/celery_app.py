from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "webcrawler",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.crawler.tasks", "app.crawler.daily_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_routes={
        "app.crawler.tasks.run_crawl_job": {"queue": "crawl_queue"},
        "app.crawler.tasks.crawl_single_url": {"queue": "crawl_queue"},
    },
    beat_schedule={
        "check-scheduled-crawls": {
            "task": "app.crawler.tasks.check_scheduled_jobs",
            "schedule": 60.0,
        },
        "daily-crawl-6am-utc": {
            "task": "app.crawler.daily_tasks.run_daily_crawl",
            "schedule": 60.0 * 60 * 24,
            "options": {"queue": "crawl_queue"},
        },
    },
)
