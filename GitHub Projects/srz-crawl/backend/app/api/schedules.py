# /opt/srz-crawl/app/api/schedules.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from loguru import logger

from app.auth.middleware import get_current_user, CurrentUser, require_editor
from app.models.schemas import ScheduleCreate, ScheduleUpdate, ScheduleResponse
from app.utils.dynamic_supabase import get_supabase_client_for_user
from app.crawler.scheduler import add_schedule, remove_schedule, SCHEDULE_CRONS

router = APIRouter()


def _schedule_type_to_cron(schedule_type: str, custom_expression: str = None) -> str:
    if schedule_type == "custom" and custom_expression:
        return custom_expression
    return SCHEDULE_CRONS.get(schedule_type, "0 2 * * *")


@router.get("", response_model=List[ScheduleResponse])
async def list_schedules(current_user: CurrentUser = Depends(get_current_user)):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("crawl_schedules")
        .select("*, domains(url)")
        .eq("user_id", current_user.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = result.data or []
    return [
        {
            **r,
            "domain_url": (r.get("domains") or {}).get("url", ""),
        }
        for r in rows
    ]


@router.post("", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    data: ScheduleCreate,
    current_user: CurrentUser = Depends(require_editor),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)

    # Verify domain belongs to user
    domain = (
        supabase.table("domains")
        .select("id, url")
        .eq("id", data.domain_id)
        .eq("user_id", current_user.user_id)
        .maybe_single()
        .execute()
    )
    if not domain.data:
        raise HTTPException(status_code=404, detail="Domain not found")

    cron_expr = _schedule_type_to_cron(data.schedule_type, data.cron_expression)

    result = supabase.table("crawl_schedules").insert({
        "user_id": current_user.user_id,
        "domain_id": data.domain_id,
        "name": data.name,
        "schedule_type": data.schedule_type,
        "cron_expression": cron_expr,
        "urls": data.urls,
        "is_enabled": True,
        "is_recurring": data.is_recurring,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create schedule")

    schedule = result.data[0]

    # Register with APScheduler
    try:
        add_schedule(schedule["id"], cron_expr, {**schedule, "domains": domain.data})
    except Exception as e:
        logger.warning(f"Could not add to scheduler: {e}")

    return {**schedule, "domain_url": domain.data["url"]}


@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: str,
    data: ScheduleUpdate,
    current_user: CurrentUser = Depends(require_editor),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)

    update_data = data.model_dump(exclude_none=True)
    if "schedule_type" in update_data:
        update_data["cron_expression"] = _schedule_type_to_cron(
            update_data["schedule_type"], update_data.get("cron_expression")
        )

    result = (
        supabase.table("crawl_schedules")
        .update(update_data)
        .eq("id", schedule_id)
        .eq("user_id", current_user.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Schedule not found")

    schedule = result.data[0]
    domain = supabase.table("domains").select("url").eq("id", schedule["domain_id"]).single().execute()

    # Re-register with scheduler if cron changed
    if "cron_expression" in update_data:
        try:
            remove_schedule(schedule_id)
            if schedule.get("is_enabled"):
                add_schedule(schedule_id, schedule["cron_expression"], schedule)
        except Exception as e:
            logger.warning(f"Scheduler update error: {e}")

    return {**schedule, "domain_url": (domain.data or {}).get("url", "")}


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: str,
    current_user: CurrentUser = Depends(require_editor),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("crawl_schedules")
        .delete()
        .eq("id", schedule_id)
        .eq("user_id", current_user.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Schedule not found")
    remove_schedule(schedule_id)


@router.post("/{schedule_id}/toggle")
async def toggle_schedule(
    schedule_id: str,
    current_user: CurrentUser = Depends(require_editor),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    existing = (
        supabase.table("crawl_schedules")
        .select("is_enabled, cron_expression")
        .eq("id", schedule_id)
        .eq("user_id", current_user.user_id)
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=404, detail="Schedule not found")

    new_state = not existing.data["is_enabled"]
    supabase.table("crawl_schedules").update({"is_enabled": new_state}).eq("id", schedule_id).execute()

    if new_state:
        # Re-add to scheduler
        schedule = supabase.table("crawl_schedules").select("*").eq("id", schedule_id).single().execute()
        if schedule.data:
            try:
                add_schedule(schedule_id, schedule.data["cron_expression"], schedule.data)
            except Exception as e:
                logger.warning(f"Scheduler toggle error: {e}")
    else:
        remove_schedule(schedule_id)

    return {"is_enabled": new_state}
