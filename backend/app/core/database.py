from supabase import create_client, Client
from app.core.config import settings
from loguru import logger

_client: Client | None = None


def get_db() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _client


async def init_db():
    """Verify Supabase connection on startup."""
    try:
        db = get_db()
        db.table("crawl_jobs").select("id").limit(1).execute()
        logger.info("Supabase connection established.")
    except Exception as e:
        logger.warning(f"Supabase init check: {e} — ensure tables are created via migrations.")
