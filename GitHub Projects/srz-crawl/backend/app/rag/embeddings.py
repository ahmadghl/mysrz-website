# /opt/srz-crawl/app/rag/embeddings.py
from typing import List
from openai import AsyncOpenAI
from loguru import logger

from app.utils.dynamic_supabase import get_supabase_client_for_user

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
EMBEDDING_MODEL = "text-embedding-3-small"


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Split text into overlapping chunks."""
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        if end >= len(text):
            break
        start = end - overlap
    return chunks


async def generate_embedding(text: str, api_key: str) -> List[float]:
    """Generate embedding for a text chunk using OpenAI."""
    client = AsyncOpenAI(api_key=api_key)
    response = await client.embeddings.create(
        input=text,
        model=EMBEDDING_MODEL,
    )
    return response.data[0].embedding


async def generate_and_store_embeddings(
    page_id: str,
    user_id: str,
    domain_id: str,
    content: str,
    openai_api_key: str,
) -> int:
    """Generate embeddings for a page and store in Supabase. Returns chunk count."""
    if not content or not openai_api_key:
        return 0

    chunks = chunk_text(content)
    if not chunks:
        return 0

    stored = 0
    supabase = await get_supabase_client_for_user(user_id)

    for i, chunk in enumerate(chunks):
        try:
            embedding = await generate_embedding(chunk, openai_api_key)

            supabase.table("page_embeddings").upsert({
                "page_id": page_id,
                "user_id": user_id,
                "domain_id": domain_id,
                "chunk_index": i,
                "chunk_text": chunk,
                "embedding": embedding,
            }, on_conflict="page_id,chunk_index").execute()

            stored += 1
        except Exception as e:
            logger.warning(f"Failed to generate embedding for chunk {i}: {e}")

    logger.debug(f"Stored {stored} embeddings for page {page_id}")
    return stored
