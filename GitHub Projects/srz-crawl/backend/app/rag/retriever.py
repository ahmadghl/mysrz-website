# /opt/srz-crawl/app/rag/retriever.py
from typing import List, Optional
from loguru import logger

from app.rag.embeddings import generate_embedding
from app.utils.dynamic_supabase import get_supabase_client_for_user


async def retrieve_relevant_chunks(
    query: str,
    user_id: str,
    domain_id: str,
    openai_api_key: str,
    top_k: int = 5,
) -> List[dict]:
    """
    Generate query embedding and retrieve top-k relevant chunks
    using cosine similarity search in pgvector.
    """
    try:
        # Generate embedding for the query
        query_embedding = await generate_embedding(query, openai_api_key)

        # Vector search via Supabase RPC
        supabase = await get_supabase_client_for_user(user_id)
        result = supabase.rpc(
            "match_page_embeddings",
            {
                "query_embedding": query_embedding,
                "match_count": top_k,
                "filter_domain_id": domain_id,
            },
        ).execute()

        chunks = result.data or []
        logger.debug(f"Retrieved {len(chunks)} chunks for query")
        return chunks

    except Exception as e:
        logger.error(f"Retrieval error: {e}")
        return []


def build_context(chunks: List[dict], max_tokens: int = 6000) -> tuple[str, List[dict]]:
    """Build context string from chunks and return sources."""
    context_parts = []
    sources = []
    char_count = 0
    char_limit = max_tokens * 4  # rough chars-to-tokens ratio

    for chunk in chunks:
        text = chunk.get("chunk_text", "")
        if char_count + len(text) > char_limit:
            break
        context_parts.append(f"[Source: {chunk.get('url', 'Unknown')}]\n{text}")
        char_count += len(text)

        # Deduplicate sources by URL
        url = chunk.get("url")
        if url and not any(s["url"] == url for s in sources):
            sources.append({
                "url": url,
                "title": chunk.get("title", url),
                "similarity": round(chunk.get("similarity", 0), 3),
            })

    return "\n\n---\n\n".join(context_parts), sources
