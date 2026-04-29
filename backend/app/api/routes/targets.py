from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid

from app.core.database import get_db

router = APIRouter()


class TargetCreate(BaseModel):
    url: str
    label: Optional[str] = None
    enabled: bool = True
    crawl_mode: str = "auto"
    max_pages: Optional[int] = 5000


class TargetUpdate(BaseModel):
    label: Optional[str] = None
    enabled: Optional[bool] = None
    crawl_mode: Optional[str] = None
    max_pages: Optional[int] = None


def _utcnow():
    return datetime.now(timezone.utc).isoformat()


@router.get("/")
async def list_targets():
    db = get_db()
    return db.table("url_targets").select("*").order("created_at", desc=False).execute().data or []


@router.post("/", status_code=201)
async def create_target(payload: TargetCreate):
    db = get_db()
    url = payload.url.strip().rstrip("/")
    if not url.startswith(("http://", "https://")):
        raise HTTPException(422, "URL must start with http:// or https://")

    # Check duplicate
    existing = db.table("url_targets").select("id").eq("url", url).execute().data
    if existing:
        raise HTTPException(409, "URL already exists in targets")

    record = {
        "id":         str(uuid.uuid4()),
        "url":        url,
        "label":      payload.label or url,
        "enabled":    payload.enabled,
        "crawl_mode": payload.crawl_mode,
        "max_pages":  payload.max_pages,
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
    res = db.table("url_targets").insert(record).execute()
    return res.data[0]


@router.patch("/{target_id}")
async def update_target(target_id: str, payload: TargetUpdate):
    db = get_db()
    updates = payload.model_dump(exclude_none=True)
    updates["updated_at"] = _utcnow()
    res = db.table("url_targets").update(updates).eq("id", target_id).execute()
    if not res.data:
        raise HTTPException(404, "Target not found")
    return res.data[0]


@router.post("/{target_id}/enable")
async def enable_target(target_id: str):
    db = get_db()
    db.table("url_targets").update({"enabled": True, "updated_at": _utcnow()}).eq("id", target_id).execute()
    return {"message": "Target enabled"}


@router.post("/{target_id}/disable")
async def disable_target(target_id: str):
    db = get_db()
    db.table("url_targets").update({"enabled": False, "updated_at": _utcnow()}).eq("id", target_id).execute()
    return {"message": "Target disabled"}


@router.delete("/{target_id}")
async def delete_target(target_id: str):
    db = get_db()
    db.table("url_targets").delete().eq("id", target_id).execute()
    return {"message": "Target deleted"}


@router.post("/bulk-toggle")
async def bulk_toggle(payload: dict):
    """Enable or disable multiple targets at once. Body: {ids: [...], enabled: bool}"""
    db = get_db()
    ids = payload.get("ids", [])
    enabled = payload.get("enabled", True)
    if not ids:
        raise HTTPException(422, "No IDs provided")
    db.table("url_targets").update({"enabled": enabled, "updated_at": _utcnow()}).in_("id", ids).execute()
    return {"updated": len(ids)}


@router.post("/run-now")
async def run_daily_crawl_now():
    """Manually trigger the daily crawl immediately (for testing)."""
    from app.crawler.tasks import run_daily_crawl
    task = run_daily_crawl.apply_async(queue="crawl_queue")
    return {"message": "Daily crawl triggered", "task_id": task.id}
