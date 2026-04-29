from fastapi import APIRouter
import redis as redis_lib
from app.core.config import settings

router = APIRouter()

@router.get("/health")
async def health():
    redis_ok = False
    try:
        r = redis_lib.from_url(settings.REDIS_URL)
        r.ping()
        redis_ok = True
    except Exception:
        pass
    return {"status": "ok", "redis": redis_ok}
