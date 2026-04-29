# /opt/srz-crawl/app/api/team.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from loguru import logger

from app.auth.middleware import get_current_user, CurrentUser, require_admin
from app.models.schemas import TeamInvite, TeamMemberUpdate, TeamMemberResponse
from app.utils.dynamic_supabase import get_supabase_client_for_user, get_supabase_client

router = APIRouter()


@router.get("", response_model=List[TeamMemberResponse])
async def list_team_members(current_user: CurrentUser = Depends(require_admin)):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("team_members")
        .select("*")
        .eq("account_owner_id", current_user.user_id)
        .order("invited_at", desc=True)
        .execute()
    )
    return result.data or []


@router.post("/invite", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def invite_team_member(
    data: TeamInvite,
    current_user: CurrentUser = Depends(require_admin),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)

    # Check if already invited
    existing = (
        supabase.table("team_members")
        .select("id, status")
        .eq("account_owner_id", current_user.user_id)
        .eq("email", data.email)
        .maybe_single()
        .execute()
    )
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User {data.email} already invited (status: {existing.data['status']})",
        )

    # Check if the user already has an account
    central = get_supabase_client()
    user_lookup = central.table("profiles").select("id").eq("email", data.email).maybe_single().execute()
    member_user_id = user_lookup.data["id"] if user_lookup.data else None

    result = supabase.table("team_members").insert({
        "account_owner_id": current_user.user_id,
        "member_user_id": member_user_id,
        "email": data.email,
        "role": data.role,
        "status": "active" if member_user_id else "pending",
        "joined_at": "now()" if member_user_id else None,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to invite team member")

    # TODO: Send invitation email via Supabase Auth or email service

    return result.data[0]


@router.put("/{member_id}/role")
async def update_member_role(
    member_id: str,
    data: TeamMemberUpdate,
    current_user: CurrentUser = Depends(require_admin),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("team_members")
        .update({"role": data.role})
        .eq("id", member_id)
        .eq("account_owner_id", current_user.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Team member not found")
    return {"success": True, "role": data.role}


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_team_member(
    member_id: str,
    current_user: CurrentUser = Depends(require_admin),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("team_members")
        .delete()
        .eq("id", member_id)
        .eq("account_owner_id", current_user.user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Team member not found")
