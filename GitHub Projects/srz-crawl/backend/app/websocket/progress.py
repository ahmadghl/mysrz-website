# /opt/srz-crawl/app/websocket/progress.py
import asyncio
import json
from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from loguru import logger

from app.crawler.queue_worker import get_job_progress

router = APIRouter()

# Active WebSocket connections per job_id
_connections: Dict[str, Set[WebSocket]] = {}


@router.websocket("/ws/crawl/{job_id}")
async def crawl_progress_ws(
    websocket: WebSocket,
    job_id: str,
):
    await websocket.accept()
    logger.info(f"WebSocket connected for job {job_id}")

    if job_id not in _connections:
        _connections[job_id] = set()
    _connections[job_id].add(websocket)

    try:
        while True:
            # Send current progress
            progress = await get_job_progress(job_id)
            if progress:
                await websocket.send_text(json.dumps(progress))
                # Stop sending if job is done
                if progress.get("status") in ("completed", "failed", "stopped"):
                    await asyncio.sleep(1)
                    break
            else:
                await websocket.send_text(json.dumps({"status": "pending", "job_id": job_id}))

            await asyncio.sleep(1)

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for job {job_id}")
    except Exception as e:
        logger.error(f"WebSocket error for job {job_id}: {e}")
    finally:
        if job_id in _connections:
            _connections[job_id].discard(websocket)
            if not _connections[job_id]:
                del _connections[job_id]


async def broadcast_progress(job_id: str, progress: dict):
    """Broadcast progress update to all connected clients for a job."""
    if job_id not in _connections:
        return
    dead = set()
    for ws in _connections[job_id]:
        try:
            await ws.send_text(json.dumps(progress))
        except Exception:
            dead.add(ws)
    _connections[job_id] -= dead
