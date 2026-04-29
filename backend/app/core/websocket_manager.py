from fastapi import WebSocket
from typing import Dict, List
import json


class WebSocketManager:
    def __init__(self):
        # job_id -> list of connected websockets
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        if job_id not in self.active:
            self.active[job_id] = []
        self.active[job_id].append(websocket)

    def disconnect(self, websocket: WebSocket, job_id: str):
        if job_id in self.active:
            self.active[job_id].remove(websocket)
            if not self.active[job_id]:
                del self.active[job_id]

    async def broadcast(self, job_id: str, data: dict):
        """Send update to all clients watching a specific job."""
        if job_id not in self.active:
            return
        message = json.dumps(data)
        dead = []
        for ws in self.active[job_id]:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active[job_id].remove(ws)

    async def broadcast_all(self, data: dict):
        """Send update to all connected clients."""
        message = json.dumps(data)
        for job_id, connections in self.active.items():
            for ws in connections:
                try:
                    await ws.send_text(message)
                except Exception:
                    pass


websocket_manager = WebSocketManager()
