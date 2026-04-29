# /opt/srz-crawl/app/api/settings.py
from fastapi import APIRouter, Depends, HTTPException, status
from openai import AsyncOpenAI
from loguru import logger

from app.auth.middleware import get_current_user, CurrentUser
from app.models.schemas import (
    OpenAIKeyUpdate, OpenAIKeyResponse,
    PromptUpdate, PromptResponse,
    SubscriptionResponse,
)
from app.utils.dynamic_supabase import get_supabase_client_for_user
from app.utils.encryption import encrypt, decrypt, mask_key
from app.utils.limits import get_user_limits

router = APIRouter()

DEFAULT_SYSTEM_PROMPT = """You are a helpful AI assistant that answers questions based on the provided website content.
Use the context provided to answer questions accurately and cite your sources."""


# ─── OpenAI Key ──────────────────────────────────────────────────────────────

@router.get("/openai-key", response_model=OpenAIKeyResponse)
async def get_openai_key(current_user: CurrentUser = Depends(get_current_user)):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("user_openai_keys")
        .select("api_key_encrypted, model, temperature")
        .eq("user_id", current_user.user_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        return OpenAIKeyResponse(has_key=False, masked_key=None, model="gpt-4-turbo", temperature=0.7)

    try:
        raw_key = decrypt(result.data["api_key_encrypted"])
        masked = mask_key(raw_key)
    except Exception:
        masked = "sk-...****"

    return OpenAIKeyResponse(
        has_key=True,
        masked_key=masked,
        model=result.data.get("model", "gpt-4-turbo"),
        temperature=result.data.get("temperature", 0.7),
    )


@router.post("/openai-key")
async def save_openai_key(
    data: OpenAIKeyUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    # Test the key first
    try:
        client = AsyncOpenAI(api_key=data.api_key)
        await client.models.list()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OpenAI API key: {str(e)}",
        )

    encrypted_key = encrypt(data.api_key)
    supabase = await get_supabase_client_for_user(current_user.user_id)
    supabase.table("user_openai_keys").upsert({
        "user_id": current_user.user_id,
        "api_key_encrypted": encrypted_key,
        "model": data.model,
        "temperature": data.temperature,
        "updated_at": "now()",
    }, on_conflict="user_id").execute()

    return {"success": True, "message": "OpenAI API key saved"}


# ─── System Prompt ───────────────────────────────────────────────────────────

@router.get("/prompt", response_model=PromptResponse)
async def get_prompt(current_user: CurrentUser = Depends(get_current_user)):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("user_openai_keys")
        .select("system_prompt")
        .eq("user_id", current_user.user_id)
        .maybe_single()
        .execute()
    )
    system_prompt = (result.data or {}).get("system_prompt") or DEFAULT_SYSTEM_PROMPT
    return PromptResponse(system_prompt=system_prompt, default_prompt=DEFAULT_SYSTEM_PROMPT)


@router.post("/prompt")
async def save_prompt(
    data: PromptUpdate,
    current_user: CurrentUser = Depends(get_current_user),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    supabase.table("user_openai_keys").upsert({
        "user_id": current_user.user_id,
        "api_key_encrypted": "",  # placeholder if no key yet
        "system_prompt": data.system_prompt,
        "updated_at": "now()",
    }, on_conflict="user_id").execute()
    return {"success": True}


# ─── Subscription ─────────────────────────────────────────────────────────────

@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(current_user: CurrentUser = Depends(get_current_user)):
    limits = await get_user_limits(current_user.user_id)
    return SubscriptionResponse(
        tier=limits["tier"],
        pages_used=limits.get("pages_used", 0),
        pages_limit=limits.get("pages_per_month", 1000),
        storage_used_mb=limits.get("storage_used_mb", 0),
        storage_limit_mb=limits.get("storage_mb", 100),
        crawls_this_month=limits.get("crawls_this_month", 0),
        team_members_count=limits.get("team_members_count", 0),
        team_members_limit=limits.get("team_members", 1),
    )
