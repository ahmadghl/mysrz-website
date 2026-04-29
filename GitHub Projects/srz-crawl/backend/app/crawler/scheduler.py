# /opt/srz-crawl/app/crawler/scheduler.py
import uuid
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from loguru import logger

from app.utils.dynamic_supabase import get_supabase_client

_scheduler = AsyncIOScheduler()

SCHEDULE_CRONS = {
    "hourly": "0 * * * *",
    "12_hours": "0 */12 * * *",
    "daily": "0 2 * * *",
    "weekly": "0 2 * * 1",
    "monthly": "0 2 1 * *",
}


def start_scheduler():
    """Start the APScheduler and load all active schedules."""
    _scheduler.add_job(
        _load_and_refresh_schedules,
        trigger=CronTrigger(minute="*/15"),  # check every 15 min
        id="refresh_schedules",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("APScheduler started")


def stop_scheduler():
    _scheduler.shutdown(wait=False)


async def _load_and_refresh_schedules():
    """Reload all active schedules from DB into APScheduler."""
    try:
        supabase = get_supabase_client()
        result = (
            supabase.table("crawl_schedules")
            .select("*, domains(url, user_id)")
            .eq("is_enabled", True)
            .execute()
        )
        schedules = result.data or []

        for schedule in schedules:
            schedule_id = schedule["id"]
            job_id_str = f"schedule_{schedule_id}"

            cron_expr = schedule.get("cron_expression") or SCHEDULE_CRONS.get(
                schedule["schedule_type"], "0 2 * * *"
            )

            if not _scheduler.get_job(job_id_str):
                parts = cron_expr.split()
                if len(parts) == 5:
                    minute, hour, day, month, day_of_week = parts
                    trigger = CronTrigger(
                        minute=minute,
                        hour=hour,
                        day=day,
                        month=month,
                        day_of_week=day_of_week,
                    )
                    _scheduler.add_job(
                        _execute_schedule,
                        trigger=trigger,
                        args=[schedule],
                        id=job_id_str,
                        replace_existing=True,
                    )
                    logger.info(f"Scheduled job added: {job_id_str} ({cron_expr})")

    except Exception as e:
        logger.error(f"Error loading schedules: {e}")


async def _execute_schedule(schedule: dict):
    """Execute a scheduled crawl with retry logic."""
    from app.crawler.queue_worker import enqueue_crawl

    schedule_id = schedule["id"]
    user_id = schedule["domains"]["user_id"]
    domain_id = schedule["domain_id"]

    logger.info(f"Executing schedule {schedule_id} for domain {domain_id}")

    # Get user's OpenAI key
    openai_key = await _get_openai_key(user_id)

    retries = 3
    for attempt in range(retries):
        try:
            supabase = get_supabase_client()
            exec_result = supabase.table("schedule_executions").insert({
                "schedule_id": schedule_id,
                "user_id": user_id,
                "status": "running",
            }).execute()

            exec_id = exec_result.data[0]["id"]
            job_id = str(uuid.uuid4())

            await enqueue_crawl(
                user_id=user_id,
                job_id=job_id,
                domain_ids=[domain_id],
                openai_api_key=openai_key,
            )

            supabase.table("schedule_executions").update({
                "status": "completed",
                "completed_at": "now()",
            }).eq("id", exec_id).execute()

            supabase.table("crawl_schedules").update({
                "last_run_at": "now()",
            }).eq("id", schedule_id).execute()

            break

        except Exception as e:
            logger.error(f"Schedule execution attempt {attempt + 1} failed: {e}")
            if attempt == retries - 1:
                try:
                    supabase = get_supabase_client()
                    supabase.table("schedule_executions").insert({
                        "schedule_id": schedule_id,
                        "user_id": user_id,
                        "status": "failed",
                        "error": str(e),
                        "completed_at": "now()",
                    }).execute()
                except Exception:
                    pass


async def _get_openai_key(user_id: str) -> str | None:
    try:
        from app.utils.encryption import decrypt
        supabase = get_supabase_client()
        result = (
            supabase.table("user_openai_keys")
            .select("api_key_encrypted")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if result.data:
            return decrypt(result.data["api_key_encrypted"])
    except Exception:
        pass
    return None


def add_schedule(schedule_id: str, cron_expression: str, schedule_data: dict):
    """Dynamically add a new schedule."""
    parts = cron_expression.split()
    if len(parts) != 5:
        raise ValueError(f"Invalid cron expression: {cron_expression}")
    minute, hour, day, month, day_of_week = parts
    trigger = CronTrigger(
        minute=minute, hour=hour, day=day,
        month=month, day_of_week=day_of_week,
    )
    _scheduler.add_job(
        _execute_schedule,
        trigger=trigger,
        args=[schedule_data],
        id=f"schedule_{schedule_id}",
        replace_existing=True,
    )


def remove_schedule(schedule_id: str):
    """Remove a schedule from APScheduler."""
    job_id = f"schedule_{schedule_id}"
    if _scheduler.get_job(job_id):
        _scheduler.remove_job(job_id)
