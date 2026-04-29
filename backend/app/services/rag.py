"""
RAG service: retrieves relevant page chunks via vector search,
then generates a grounded answer with source citations using GPT-4o.
"""
from typing import List, AsyncGenerator
from loguru import logger
import httpx

from app.core.config import settings
from app.core.database import get_db
from app.services.embeddings import embed_single


SYSTEM_PROMPT = """You are a helpful assistant that answers questions based ONLY on the provided web page excerpts.

Rules:
- Answer clearly and concisely using only the context provided.
- Always cite your sources using [1], [2], etc. referencing the source list at the end.
- If the context does not contain enough information to answer, say so explicitly — do not hallucinate.
- Format your answer in clean markdown.
- At the end of your answer, list all sources you cited as:
  Sources:
  [1] Page Title — https://url
  [2] Page Title — https://url
"""


async def vector_search(query_embedding: List[float], top_k: int = 8, threshold: float = 0.70) -> List[dict]:
    """Call the pgvector match function via Supabase RPC."""
    db = get_db()
    try:
        result = db.rpc("match_page_chunks", {
            "query_embedding": query_embedding,
            "match_count": top_k,
            "match_threshold": threshold,
        }).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        return []


def build_context(chunks: List[dict]) -> str:
    """Format retrieved chunks into a numbered context block."""
    parts = []
    for i, chunk in enumerate(chunks, 1):
        title = chunk.get("title") or "Untitled"
        url = chunk.get("url", "")
        text = chunk.get("chunk_text", "")
        sim = chunk.get("similarity", 0)
        parts.append(
            f"[{i}] Source: {title}\n"
            f"    URL: {url}\n"
            f"    Relevance: {sim:.2f}\n\n"
            f"    {text}\n"
        )
    return "\n---\n".join(parts)


async def rag_answer(
    question: str,
    history: List[dict] | None = None,
    top_k: int = 8,
    threshold: float = 0.68,
) -> dict:
    """
    Full RAG pipeline:
    1. Embed the question
    2. Vector search for relevant chunks
    3. Build context
    4. Call GPT-4o for grounded answer
    Returns { answer, sources, chunks_used }
    """
    # 1. Embed question
    query_vector = await embed_single(question)
    if not query_vector:
        return {"answer": "Failed to embed your question. Please try again.", "sources": [], "chunks_used": 0}

    # 2. Vector search
    chunks = await vector_search(query_vector, top_k=top_k, threshold=threshold)
    if not chunks:
        return {
            "answer": "I couldn't find any relevant content in the crawled pages for your question. "
                      "Try rephrasing, or make sure the relevant sites have been crawled.",
            "sources": [],
            "chunks_used": 0,
        }

    # 3. Build context
    context = build_context(chunks)

    # 4. Build messages
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add conversation history (last 6 turns for context window management)
    if history:
        for msg in history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({
        "role": "user",
        "content": f"Context from crawled pages:\n\n{context}\n\n---\n\nQuestion: {question}",
    })

    # 5. Call GPT-4o
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o",
                    "messages": messages,
                    "temperature": 0.2,
                    "max_tokens": 2000,
                },
            )
            resp.raise_for_status()
            answer = resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"GPT-4o call failed: {e}")
        return {"answer": f"AI error: {str(e)}", "sources": [], "chunks_used": len(chunks)}

    # 6. Build source list (deduplicated by URL)
    seen_urls = set()
    sources = []
    for chunk in chunks:
        url = chunk.get("url", "")
        if url not in seen_urls:
            seen_urls.add(url)
            sources.append({
                "url": url,
                "title": chunk.get("title") or url,
                "similarity": round(chunk.get("similarity", 0), 3),
            })

    return {
        "answer": answer,
        "sources": sources,
        "chunks_used": len(chunks),
    }


async def rag_stream(
    question: str,
    history: List[dict] | None = None,
    top_k: int = 8,
    threshold: float = 0.68,
) -> AsyncGenerator[str, None]:
    """
    Streaming version of rag_answer.
    Yields SSE-formatted chunks: data: {...}\n\n
    """
    import json

    query_vector = await embed_single(question)
    if not query_vector:
        yield f"data: {json.dumps({'type': 'error', 'content': 'Embedding failed'})}\n\n"
        return

    chunks = await vector_search(query_vector, top_k=top_k, threshold=threshold)
    if not chunks:
        yield f"data: {json.dumps({'type': 'error', 'content': 'No relevant content found.'})}\n\n"
        return

    # Send sources first so UI can show them immediately
    seen_urls = set()
    sources = []
    for chunk in chunks:
        url = chunk.get("url", "")
        if url not in seen_urls:
            seen_urls.add(url)
            sources.append({
                "url": url,
                "title": chunk.get("title") or url,
                "similarity": round(chunk.get("similarity", 0), 3),
            })
    yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

    context = build_context(chunks)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        for msg in history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({
        "role": "user",
        "content": f"Context from crawled pages:\n\n{context}\n\n---\n\nQuestion: {question}",
    })

    try:
        async with httpx.AsyncClient(timeout=90) as client:
            async with client.stream(
                "POST",
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o",
                    "messages": messages,
                    "temperature": 0.2,
                    "max_tokens": 2000,
                    "stream": True,
                },
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        payload = line[6:]
                        if payload == "[DONE]":
                            yield f"data: {json.dumps({'type': 'done'})}\n\n"
                            break
                        try:
                            delta = json.loads(payload)
                            token = delta["choices"][0]["delta"].get("content", "")
                            if token:
                                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                        except Exception:
                            pass
    except Exception as e:
        logger.error(f"Streaming GPT-4o failed: {e}")
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
