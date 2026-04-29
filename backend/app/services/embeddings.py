"""
Embedding service: generates OpenAI embeddings for page chunks
and upserts them into the page_embeddings table via Supabase.
"""
import asyncio
from typing import List
from loguru import logger

import httpx

from app.core.config import settings
from app.core.database import get_db
from app.services.chunker import chunk_text


EMBED_MODEL = "text-embedding-3-small"
EMBED_BATCH_SIZE = 100          # OpenAI allows up to 2048 inputs per request
EMBED_DIMENSION = 1536


async def embed_texts(texts: List[str]) -> List[List[float]]:
    """Call OpenAI Embeddings API and return list of embedding vectors."""
    if not texts:
        return []

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/embeddings",
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"model": EMBED_MODEL, "input": texts},
        )
        resp.raise_for_status()
        data = resp.json()
        return [item["embedding"] for item in data["data"]]


async def embed_single(text: str) -> List[float]:
    """Embed a single query string."""
    results = await embed_texts([text])
    return results[0] if results else []


async def embed_and_store_page(
    page_id: str,
    job_id: str,
    url: str,
    title: str,
    text: str,
) -> int:
    """
    Chunk page text, embed each chunk, and store in page_embeddings.
    Returns the number of chunks stored.
    Deletes old embeddings for this page first (upsert behaviour).
    """
    db = get_db()

    # Delete existing embeddings for this page
    db.table("page_embeddings").delete().eq("page_id", page_id).execute()

    chunks = chunk_text(text, url=url, title=title)
    if not chunks:
        logger.debug(f"No chunks for page {url}")
        return 0

    stored = 0
    # Process in batches
    for i in range(0, len(chunks), EMBED_BATCH_SIZE):
        batch = chunks[i : i + EMBED_BATCH_SIZE]
        texts = [c["chunk_text"] for c in batch]

        try:
            vectors = await embed_texts(texts)
        except Exception as e:
            logger.error(f"Embedding failed for {url} batch {i}: {e}")
            continue

        records = []
        for chunk, vector in zip(batch, vectors):
            records.append({
                "page_id":     page_id,
                "job_id":      job_id,
                "url":         url[:2000],
                "title":       (title or "")[:500],
                "chunk_index": chunk["chunk_index"],
                "chunk_text":  chunk["chunk_text"],
                "embedding":   vector,
                "token_count": chunk["token_count"],
            })

        try:
            db.table("page_embeddings").insert(records).execute()
            stored += len(records)
        except Exception as e:
            logger.error(f"DB insert failed for {url}: {e}")

    logger.info(f"Stored {stored} chunks for {url}")
    return stored


async def embed_job_pages(job_id: str):
    """
    Post-crawl task: embed all pages from a completed job.
    Called by Celery after crawl completes.
    """
    db = get_db()
    pages = db.table("crawled_pages") \
        .select("id, url, title, word_count") \
        .eq("job_id", job_id) \
        .is_("error", "null") \
        .gt("word_count", 50) \
        .execute().data or []

    logger.info(f"Embedding {len(pages)} pages for job {job_id}")
    count = 0
    for page in pages:
        # Fetch full text — stored separately or re-use word count as proxy
        # In production, store raw text in a separate column or Supabase Storage
        # For now, re-crawl is avoided by storing text in crawled_pages.body
        body = db.table("crawled_pages") \
            .select("body") \
            .eq("id", page["id"]) \
            .single().execute().data
        text = (body or {}).get("body", "")
        if not text:
            continue

        n = await embed_and_store_page(
            page_id=page["id"],
            job_id=job_id,
            url=page["url"],
            title=page.get("title", ""),
            text=text,
        )
        count += n
        await asyncio.sleep(0.1)   # gentle rate limit

    logger.info(f"Embedding complete: {count} total chunks for job {job_id}")
    return count
