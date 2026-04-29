from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.services.rag import rag_answer, rag_stream

router = APIRouter()


def _utcnow():
    return datetime.now(timezone.utc).isoformat()


# ── Session models ─────────────────────────────────────────────

class SessionCreate(BaseModel):
    title: Optional[str] = "New chat"


class SessionUpdate(BaseModel):
    title: str


class ChatRequest(BaseModel):
    question: str
    stream: bool = True


# ── Sessions ───────────────────────────────────────────────────

@router.get("/sessions")
async def list_sessions():
    db = get_db()
    return db.table("chat_sessions") \
        .select("*, chat_messages(count)") \
        .order("updated_at", desc=True) \
        .execute().data or []


@router.post("/sessions", status_code=201)
async def create_session(payload: SessionCreate):
    db = get_db()
    record = {
        "id":         str(uuid.uuid4()),
        "title":      payload.title or "New chat",
        "created_at": _utcnow(),
        "updated_at": _utcnow(),
    }
    res = db.table("chat_sessions").insert(record).execute()
    return res.data[0]


@router.patch("/sessions/{session_id}")
async def rename_session(session_id: str, payload: SessionUpdate):
    db = get_db()
    res = db.table("chat_sessions") \
        .update({"title": payload.title, "updated_at": _utcnow()}) \
        .eq("id", session_id).execute()
    if not res.data:
        raise HTTPException(404, "Session not found")
    return res.data[0]


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    db = get_db()
    db.table("chat_messages").delete().eq("session_id", session_id).execute()
    db.table("chat_sessions").delete().eq("id", session_id).execute()
    return {"message": "Session deleted"}


# ── Messages ───────────────────────────────────────────────────

@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str):
    db = get_db()
    return db.table("chat_messages") \
        .select("*") \
        .eq("session_id", session_id) \
        .order("created_at", desc=False) \
        .execute().data or []


# ── RAG Chat ───────────────────────────────────────────────────

@router.post("/sessions/{session_id}/chat")
async def chat(session_id: str, payload: ChatRequest):
    db = get_db()

    # Verify session exists
    session = db.table("chat_sessions").select("id, title").eq("id", session_id).single().execute().data
    if not session:
        raise HTTPException(404, "Session not found")

    # Load conversation history
    history_rows = db.table("chat_messages") \
        .select("role, content") \
        .eq("session_id", session_id) \
        .order("created_at", desc=False) \
        .limit(20) \
        .execute().data or []

    # Save user message
    user_msg_id = str(uuid.uuid4())
    db.table("chat_messages").insert({
        "id":         user_msg_id,
        "session_id": session_id,
        "role":       "user",
        "content":    payload.question,
        "created_at": _utcnow(),
    }).execute()

    # Auto-title session from first message
    if not history_rows and session["title"] == "New chat":
        short_title = payload.question[:60] + ("…" if len(payload.question) > 60 else "")
        db.table("chat_sessions").update({"title": short_title, "updated_at": _utcnow()}).eq("id", session_id).execute()

    # ── Streaming response ─────────────────────────────────────
    if payload.stream:
        async def event_stream():
            import json
            full_answer = []
            sources = []

            async for chunk in rag_stream(payload.question, history=history_rows):
                yield chunk
                # Parse to reconstruct full answer for DB save
                if chunk.startswith("data: "):
                    try:
                        data = json.loads(chunk[6:])
                        if data["type"] == "token":
                            full_answer.append(data["content"])
                        elif data["type"] == "sources":
                            sources = data["sources"]
                    except Exception:
                        pass

            # Save assistant message after streaming completes
            answer_text = "".join(full_answer)
            db.table("chat_messages").insert({
                "id":         str(uuid.uuid4()),
                "session_id": session_id,
                "role":       "assistant",
                "content":    answer_text,
                "sources":    sources,
                "created_at": _utcnow(),
            }).execute()
            db.table("chat_sessions").update({"updated_at": _utcnow()}).eq("id", session_id).execute()

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    # ── Non-streaming response ─────────────────────────────────
    result = await rag_answer(payload.question, history=history_rows)

    db.table("chat_messages").insert({
        "id":         str(uuid.uuid4()),
        "session_id": session_id,
        "role":       "assistant",
        "content":    result["answer"],
        "sources":    result["sources"],
        "created_at": _utcnow(),
    }).execute()
    db.table("chat_sessions").update({"updated_at": _utcnow()}).eq("id", session_id).execute()

    return result
