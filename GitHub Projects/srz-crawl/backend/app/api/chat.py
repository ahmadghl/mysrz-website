# /opt/srz-crawl/app/api/chat.py
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List, Optional
from loguru import logger

from app.auth.middleware import get_current_user, CurrentUser
from app.models.schemas import (
    ChatSessionCreate, ChatSessionResponse,
    MessageCreate, MessageResponse, FileUploadResponse
)
from app.utils.dynamic_supabase import get_supabase_client_for_user
from app.utils.encryption import decrypt
from app.rag.chat_engine import chat_with_rag

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


async def _get_user_openai_config(user_id: str) -> dict:
    """Get user's OpenAI config (key + model + temperature)."""
    supabase = await get_supabase_client_for_user(user_id)
    result = (
        supabase.table("user_openai_keys")
        .select("api_key_encrypted, model, temperature")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No OpenAI API key configured. Please add your key in Settings.",
        )
    return {
        "api_key": decrypt(result.data["api_key_encrypted"]),
        "model": result.data.get("model", "gpt-4-turbo"),
        "temperature": result.data.get("temperature", 0.7),
    }


async def _get_user_prompt(user_id: str) -> Optional[str]:
    try:
        supabase = await get_supabase_client_for_user(user_id)
        result = (
            supabase.table("user_openai_keys")
            .select("system_prompt")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        return (result.data or {}).get("system_prompt")
    except Exception:
        return None


# ─── Sessions ────────────────────────────────────────────────────────────────

@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_sessions(current_user: CurrentUser = Depends(get_current_user)):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("chat_sessions")
        .select("*, domains(url)")
        .eq("user_id", current_user.user_id)
        .order("last_message_at", desc=True, nullsfirst=False)
        .limit(50)
        .execute()
    )
    rows = result.data or []
    return [
        {**r, "domain_url": (r.get("domains") or {}).get("url", "")}
        for r in rows
    ]


@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    data: ChatSessionCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)

    # Verify domain
    domain = (
        supabase.table("domains")
        .select("url")
        .eq("id", data.domain_id)
        .eq("user_id", current_user.user_id)
        .maybe_single()
        .execute()
    )
    if not domain.data:
        raise HTTPException(status_code=404, detail="Domain not found")

    result = supabase.table("chat_sessions").insert({
        "user_id": current_user.user_id,
        "domain_id": data.domain_id,
        "name": data.name,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create session")
    return {**result.data[0], "domain_url": domain.data["url"]}


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    supabase.table("chat_sessions").delete().eq("id", session_id).eq("user_id", current_user.user_id).execute()


# ─── Messages ────────────────────────────────────────────────────────────────

@router.get("/sessions/{session_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    session_id: str,
    current_user: CurrentUser = Depends(get_current_user),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)
    result = (
        supabase.table("chat_messages")
        .select("*")
        .eq("session_id", session_id)
        .eq("user_id", current_user.user_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


@router.post("/sessions/{session_id}/messages", response_model=MessageResponse)
async def send_message(
    session_id: str,
    data: MessageCreate,
    current_user: CurrentUser = Depends(get_current_user),
):
    supabase = await get_supabase_client_for_user(current_user.user_id)

    # Get session and domain
    session = (
        supabase.table("chat_sessions")
        .select("domain_id")
        .eq("id", session_id)
        .eq("user_id", current_user.user_id)
        .maybe_single()
        .execute()
    )
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    domain_id = session.data["domain_id"]

    # Save user message
    supabase.table("chat_messages").insert({
        "session_id": session_id,
        "user_id": current_user.user_id,
        "role": "user",
        "content": data.content,
    }).execute()

    # Get user's OpenAI config
    config = await _get_user_openai_config(current_user.user_id)
    system_prompt = await _get_user_prompt(current_user.user_id)

    # Load conversation history for context
    history_result = (
        supabase.table("chat_messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )
    history = list(reversed(history_result.data or []))

    # Load file context if any
    file_context = None
    if data.file_ids:
        file_context = await _load_file_context(current_user.user_id, data.file_ids)

    # RAG query
    rag_result = await chat_with_rag(
        query=data.content,
        user_id=current_user.user_id,
        domain_id=domain_id,
        openai_api_key=config["api_key"],
        system_prompt=system_prompt,
        conversation_history=history[:-1],  # exclude the just-added user message
        model=config["model"],
        temperature=config["temperature"],
        file_context=file_context,
    )

    # Save assistant message
    msg_result = supabase.table("chat_messages").insert({
        "session_id": session_id,
        "user_id": current_user.user_id,
        "role": "assistant",
        "content": rag_result["content"],
        "sources": rag_result["sources"],
    }).execute()

    # Update session last_message_at
    supabase.table("chat_sessions").update({
        "last_message_at": "now()",
        "name": data.content[:60] if data.content else "Chat",
    }).eq("id", session_id).execute()

    return msg_result.data[0] if msg_result.data else {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": rag_result["content"],
        "sources": rag_result["sources"],
        "created_at": datetime.utcnow().isoformat(),
    }


# ─── File Upload ─────────────────────────────────────────────────────────────

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is 10MB.",
        )

    ALLOWED_TYPES = {
        "application/pdf", "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain", "image/jpeg", "image/png", "image/webp",
    }
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG",
        )

    content = await file.read()
    file_id = str(uuid.uuid4())
    storage_path = f"uploads/{current_user.user_id}/{file_id}/{file.filename}"

    supabase = await get_supabase_client_for_user(current_user.user_id)
    supabase.storage.from_("uploads").upload(storage_path, content, {"content-type": file.content_type})

    expires_at = datetime.utcnow() + timedelta(hours=24)
    return FileUploadResponse(
        file_id=file_id,
        filename=file.filename,
        size=len(content),
        expires_at=expires_at,
    )


async def _load_file_context(user_id: str, file_ids: List[str]) -> Optional[str]:
    """Extract text from uploaded files for chat context."""
    import io
    import PyPDF2

    texts = []
    supabase = await get_supabase_client_for_user(user_id)

    for file_id in file_ids[:3]:  # max 3 files
        try:
            # List files for this upload id
            files = supabase.storage.from_("uploads").list(f"uploads/{user_id}/{file_id}")
            if not files:
                continue
            filename = files[0]["name"]
            storage_path = f"uploads/{user_id}/{file_id}/{filename}"
            file_bytes = supabase.storage.from_("uploads").download(storage_path)

            if filename.endswith(".pdf"):
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                text = " ".join(page.extract_text() or "" for page in reader.pages)
                texts.append(f"[File: {filename}]\n{text[:10000]}")
            elif filename.endswith(".txt"):
                texts.append(f"[File: {filename}]\n{file_bytes.decode('utf-8', errors='ignore')[:10000]}")
        except Exception as e:
            logger.warning(f"Could not load file {file_id}: {e}")

    return "\n\n".join(texts) if texts else None
