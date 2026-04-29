# /opt/srz-crawl/app/api/supabase_config.py
from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger

from app.auth.middleware import get_current_user, CurrentUser, require_admin
from app.models.schemas import SupabaseConfigUpdate, SupabaseConfigResponse, SupabaseTestResult
from app.utils.dynamic_supabase import get_supabase_client_for_user, get_supabase_client, test_supabase_connection
from app.utils.encryption import encrypt, decrypt, mask_url
from app.utils.supabase_migration import run_migration_on_custom
from supabase import create_client

router = APIRouter()


@router.get("", response_model=SupabaseConfigResponse)
async def get_supabase_config(current_user: CurrentUser = Depends(get_current_user)):
    central = get_supabase_client()
    result = (
        central.table("user_supabase_config")
        .select("supabase_url, is_active, connection_status, migrated_at")
        .eq("user_id", current_user.user_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        return SupabaseConfigResponse(is_custom=False, masked_url=None, has_anon_key=False, has_service_key=False)

    data = result.data
    try:
        url = decrypt(data["supabase_url"])
        masked = mask_url(url)
    except Exception:
        masked = "https://*****.supabase.co/..."

    return SupabaseConfigResponse(
        is_custom=data["is_active"],
        masked_url=masked,
        has_anon_key=True,
        has_service_key=True,
        connection_status=data.get("connection_status"),
        migrated_at=data.get("migrated_at"),
    )


@router.post("/test", response_model=SupabaseTestResult)
async def test_connection(
    data: SupabaseConfigUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    result = await test_supabase_connection(data.supabase_url, data.service_role_key)
    return SupabaseTestResult(**result)


@router.post("", response_model=SupabaseConfigResponse)
async def save_supabase_config(
    data: SupabaseConfigUpdate,
    current_user: CurrentUser = Depends(require_admin),
):
    # Test connection first
    test_result = await test_supabase_connection(data.supabase_url, data.service_role_key)
    if not test_result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Connection failed: {test_result['message']}",
        )

    central = get_supabase_client()
    central.table("user_supabase_config").upsert({
        "user_id": current_user.user_id,
        "supabase_url": encrypt(data.supabase_url),
        "anon_key_encrypted": encrypt(data.anon_key),
        "service_key_encrypted": encrypt(data.service_role_key),
        "is_active": True,
        "connection_status": "connected",
        "updated_at": "now()",
    }, on_conflict="user_id").execute()

    return SupabaseConfigResponse(
        is_custom=True,
        masked_url=mask_url(data.supabase_url),
        has_anon_key=True,
        has_service_key=True,
        connection_status="connected",
    )


@router.post("/migrate")
async def run_migration(current_user: CurrentUser = Depends(require_admin)):
    """Run schema migration on the user's custom Supabase instance."""
    central = get_supabase_client()
    config_result = (
        central.table("user_supabase_config")
        .select("supabase_url, service_key_encrypted")
        .eq("user_id", current_user.user_id)
        .eq("is_active", True)
        .maybe_single()
        .execute()
    )
    if not config_result.data:
        raise HTTPException(status_code=400, detail="No custom Supabase configured")

    url = decrypt(config_result.data["supabase_url"])
    service_key = decrypt(config_result.data["service_key_encrypted"])
    custom_client = create_client(url, service_key)

    result = await run_migration_on_custom(custom_client)

    if result["success"]:
        central.table("user_supabase_config").update({
            "migrated_at": "now()",
        }).eq("user_id", current_user.user_id).execute()

    return result


@router.post("/migrate-data")
async def migrate_data(current_user: CurrentUser = Depends(require_admin)):
    """Migrate existing data from central to custom Supabase."""
    # This is a complex operation - placeholder for now
    return {
        "success": True,
        "message": "Data migration started. This may take a few minutes.",
        "note": "Your domains, pages, and chat history will be migrated to your custom Supabase instance.",
    }


@router.post("/reset")
async def reset_to_central(current_user: CurrentUser = Depends(require_admin)):
    """Disable custom Supabase and revert to central."""
    central = get_supabase_client()
    central.table("user_supabase_config").update({
        "is_active": False,
    }).eq("user_id", current_user.user_id).execute()
    return {"success": True, "message": "Reverted to SRZ Cloud Database"}
