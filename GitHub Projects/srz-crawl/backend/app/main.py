# /opt/srz-crawl/app/main.py
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
import sys

from app.api import domains, crawl, schedules, chat, settings, team, supabase_config
from app.websocket.progress import router as ws_router
from app.crawler.scheduler import start_scheduler, stop_scheduler

# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level=os.getenv("LOG_LEVEL", "INFO"),
)
logger.add(
    "/opt/srz-crawl/logs/app.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO",
)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting SRZ Crawl backend...")
    start_scheduler()
    logger.info("Scheduler started")
    yield
    logger.info("Shutting down SRZ Crawl backend...")
    stop_scheduler()


app = FastAPI(
    title="SRZ Crawl API",
    description="Multi-tenant web crawling and RAG platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Include routers
app.include_router(domains.router, prefix="/api/domains", tags=["Domains"])
app.include_router(crawl.router, prefix="/api/crawl", tags=["Crawl"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["Schedules"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(team.router, prefix="/api/team", tags=["Team"])
app.include_router(supabase_config.router, prefix="/api/settings/supabase", tags=["Supabase Config"])
app.include_router(ws_router, tags=["WebSocket"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
