# /opt/srz-crawl/app/utils/limits.py
from loguru import logger
from fastapi import HTTPException, status

from app.utils.dynamic_supabase import get_supabase_client_for_user

TIER_LIMITS = {
    "free": {
        "pages_per_month": 1000,
        "storage_mb": 100,
        "team_members": 1,
        "scheduled_crawls": 2,
        "domains": 3,
    },
    "starter": {
        "pages_per_month": 25000,
        "storage_mb": 1024,
        "team_members": 5,
        "scheduled_crawls": 10,
        "domains": 10,
    },
    "pro": {
        "pages_per_month": 250000,
        "storage_mb": 10240,
        "team_members": 25,
        "scheduled_crawls": 50,
        "domains": 50,
    },
    "enterprise": {
        "pages_per_month": -1,  # unlimited
        "storage_mb": -1,
        "team_members": -1,
        "scheduled_crawls": -1,
        "domains": -1,
    },
}


async def get_user_limits(user_id: str) -> dict:
    """Get subscription tier and current usage for a user."""
    try:
        supabase = await get_supabase_client_for_user(user_id)
        result = (
            supabase.table("user_limits")
            .select("*, profiles(subscription_tier)")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        if not result.data:
            return {"tier": "free", **TIER_LIMITS["free"], "pages_used": 0, "storage_used_mb": 0}

        data = result.data
        tier = data.get("profiles", {}).get("subscription_tier", "free")
        limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        return {
            "tier": tier,
            **limits,
            "pages_used": data.get("pages_crawled_this_month", 0),
            "storage_used_mb": data.get("storage_used_mb", 0),
            "crawls_this_month": data.get("crawls_this_month", 0),
            "team_members_count": data.get("team_members_count", 0),
        }
    except Exception as e:
        logger.error(f"Error getting user limits: {e}")
        return {"tier": "free", **TIER_LIMITS["free"], "pages_used": 0, "storage_used_mb": 0}


async def check_crawl_limit(user_id: str) -> None:
    """Raise HTTPException if user has exceeded crawl page limits."""
    limits = await get_user_limits(user_id)
    if limits["pages_per_month"] == -1:
        return  # unlimited
    if limits["pages_used"] >= limits["pages_per_month"]:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Monthly page limit ({limits['pages_per_month']}) reached. Please upgrade your plan.",
        )


async def check_domain_limit(user_id: str) -> None:
    """Raise HTTPException if user has exceeded domain limit."""
    limits = await get_user_limits(user_id)
    if limits["domains"] == -1:
        return
    supabase = await get_supabase_client_for_user(user_id)
    count_result = (
        supabase.table("domains")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .execute()
    )
    count = count_result.count or 0
    if count >= limits["domains"]:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Domain limit ({limits['domains']}) reached. Please upgrade your plan.",
        )


async def increment_pages_crawled(user_id: str, count: int = 1) -> None:
    """Increment the pages crawled counter for rate limiting."""
    try:
        supabase = await get_supabase_client_for_user(user_id)
        supabase.rpc("increment_pages_crawled", {"p_user_id": user_id, "p_count": count}).execute()
    except Exception as e:
        logger.warning(f"Could not increment page count: {e}")
