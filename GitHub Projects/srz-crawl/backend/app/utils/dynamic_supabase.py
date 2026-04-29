# /opt/srz-crawl/app/utils/dynamic_supabase.py
import os
from typing import Optional
from supabase import create_client, Client
from loguru import logger
from functools import lru_cache

from app.utils.encryption import decrypt

_central_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Get the central Supabase client (singleton)."""
    global _central_client
    if _central_client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise RuntimeError("Central Supabase credentials not configured")
        _central_client = create_client(url, key)
    return _central_client


async def get_supabase_client_for_user(user_id: str) -> Client:
    """
    Get the appropriate Supabase client for a given user.
    Returns custom client if user has configured one, else central.
    """
    try:
        central = get_supabase_client()
        result = (
            central.table("user_supabase_config")
            .select("supabase_url, anon_key_encrypted, service_key_encrypted, is_active")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .maybe_single()
            .execute()
        )

        if result.data:
            config = result.data
            try:
                url = decrypt(config["supabase_url"])
                service_key = decrypt(config["service_key_encrypted"])
                custom_client = create_client(url, service_key)
                # Quick health check
                custom_client.table("profiles").select("id").limit(1).execute()
                return custom_client
            except Exception as e:
                logger.warning(
                    f"Custom Supabase unavailable for user {user_id}, falling back to central: {e}"
                )

    except Exception as e:
        logger.warning(f"Could not check custom Supabase config: {e}")

    return get_supabase_client()


async def test_supabase_connection(url: str, service_key: str) -> dict:
    """Test a Supabase connection and return status."""
    import time
    try:
        start = time.time()
        client = create_client(url, service_key)
        # Test with a simple query
        client.table("profiles").select("id").limit(1).execute()
        latency_ms = (time.time() - start) * 1000
        return {"success": True, "message": "Connection successful", "latency_ms": round(latency_ms, 2)}
    except Exception as e:
        return {"success": False, "message": str(e), "latency_ms": None}
