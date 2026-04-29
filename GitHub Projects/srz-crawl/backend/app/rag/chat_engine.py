# /opt/srz-crawl/app/rag/chat_engine.py
from typing import List, Optional, AsyncGenerator
from openai import AsyncOpenAI
from loguru import logger

from app.rag.retriever import retrieve_relevant_chunks, build_context

DEFAULT_SYSTEM_PROMPT = """You are a helpful AI assistant that answers questions based on the provided website content. 
Use the context provided to answer questions accurately. 
If you cannot find the answer in the context, say so clearly.
Always cite your sources when referencing specific information."""


async def chat_with_rag(
    query: str,
    user_id: str,
    domain_id: str,
    openai_api_key: str,
    system_prompt: Optional[str] = None,
    conversation_history: Optional[List[dict]] = None,
    model: str = "gpt-4-turbo",
    temperature: float = 0.7,
    file_context: Optional[str] = None,
) -> dict:
    """
    Perform a RAG query: retrieve relevant chunks, then generate a response.
    Returns {"content": str, "sources": list}.
    """
    try:
        # Retrieve relevant chunks
        chunks = await retrieve_relevant_chunks(
            query=query,
            user_id=user_id,
            domain_id=domain_id,
            openai_api_key=openai_api_key,
        )

        context, sources = build_context(chunks)

        # Build prompt
        active_system_prompt = system_prompt or DEFAULT_SYSTEM_PROMPT

        messages = [
            {
                "role": "system",
                "content": f"{active_system_prompt}\n\n## Website Content:\n{context}",
            }
        ]

        # Add file context if any
        if file_context:
            messages.append({
                "role": "system",
                "content": f"## Uploaded File Content:\n{file_context}",
            })

        # Add conversation history
        if conversation_history:
            messages.extend(conversation_history[-10:])  # last 10 messages for context

        # Add current query
        messages.append({"role": "user", "content": query})

        # Generate response
        client = AsyncOpenAI(api_key=openai_api_key)
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=2000,
        )

        content = response.choices[0].message.content or ""
        return {"content": content, "sources": sources}

    except Exception as e:
        logger.error(f"RAG chat error: {e}")
        raise
