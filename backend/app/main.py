from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import jobs, pages, domains, stats, health, auth, targets, chat
from app.core.websocket_manager import websocket_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Web Crawler API...")
    await init_db()
    yield
    logger.info("Shutting down Web Crawler API...")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Production web crawling API",
    lifespan=lifespan,
)

class ProxyHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.scope["scheme"] = "https"
        response = await call_next(request)
        return response

app.add_middleware(ProxyHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(domains.router, prefix="/api/v1/domains", tags=["domains"])
app.include_router(pages.router, prefix="/api/v1/pages", tags=["pages"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["stats"])
app.include_router(targets.router, prefix="/api/v1/targets", tags=["targets"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await websocket_manager.connect(websocket, job_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, job_id)
