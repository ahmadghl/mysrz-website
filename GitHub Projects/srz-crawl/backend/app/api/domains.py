# /opt/srz-crawl/app/api/domains.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from loguru import logger

from app.auth.middleware import get_current_user, CurrentUser, require_editor
from app.models.schemas import DomainCreate, DomainResponse
from app.utils.dynamic_supabase import get_supabase_client_for_user
from app.utils.limits import check_domain_limit

router = APIRouter()


@router.get("", response_model=List[DomainResponse])
async def list_domains(current_user: CurrentUser = Depends(get_current_user)):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("domains")
        .select("*")
        .eq("user_id", current_user.user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.post("", response_model=DomainResponse, status_code=status.HTTP_201_CREATED)
async def add_domain(
    data: DomainCreate,
    current_user: CurrentUser = Depends(require_editor),
):
    await check_domain_limit(current_user.user_id)

    supabase = await get_supabase_client_for_user(current_user.user_id)

    # Check for duplicate
    existing = (
        supabase.table("domains")
        .select("id")
        .eq("user_id", current_user.user_id)
        .eq("url", data.url)
        .maybe_single()
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Domain already exists",
        )

    result = (
        supabase.table("domains")
        .insert({"user_id": current_user.user_id, "url": data.url})
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create domain")
    return result.data[0]


@router.put("/{domain_id}/select")
async def toggle_domain_selection(
    domain_id: str,
    current_user: CurrentUser = Depends(require_editor),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)

    # Get current state
    domain = (
        supabase.table("domains")
        .select("is_selected")
        .eq("id", domain_id)
        .eq("user_id", current_user.user_id)
        .maybe_single()
        .execute()
    )
    if not domain.data:
        raise HTTPException(status_code=404, detail="Domain not found")

    new_state = not domain.data["is_selected"]
    result = (
        supabase.table("domains")
        .update({"is_selected": new_state})
        .eq("id", domain_id)
        .eq("user_id", current_user.user_id)
        .execute()
    )
    return {"is_selected": new_state}


@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_domain(
    domain_id: str,
    current_user: CurrentUser = Depends(require_editor),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("domains")
        .delete()
        .eq("id", domain_id)
        .eq("user_id", current_user.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Domain not found")
