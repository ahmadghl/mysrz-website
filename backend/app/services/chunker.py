"""
Splits page text into overlapping chunks suitable for embedding.
Strategy: paragraph-aware, ~500 tokens per chunk, 50-token overlap.
"""
from typing import List


CHUNK_SIZE = 500      # target tokens per chunk (approx 4 chars/token)
CHUNK_OVERLAP = 50    # overlap tokens between chunks
CHARS_PER_TOKEN = 4


def _approx_tokens(text: str) -> int:
    return len(text) // CHARS_PER_TOKEN


def chunk_text(text: str, url: str = "", title: str = "") -> List[dict]:
    """
    Returns list of chunk dicts:
      { chunk_index, chunk_text, token_count }
    Prepends title to first chunk for context.
    """
    if not text or not text.strip():
        return []

    # Clean and split into paragraphs
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]

    chunks = []
    current_chars: List[str] = []
    current_tokens = 0
    chunk_index = 0

    # Prepend title to give context
    prefix = f"{title}\n\n" if title else ""

    for para in paragraphs:
        para_tokens = _approx_tokens(para)

        # If adding this paragraph exceeds chunk size, flush current chunk
        if current_tokens + para_tokens > CHUNK_SIZE and current_chars:
            chunk_body = " ".join(current_chars)
            full_chunk = (prefix + chunk_body) if chunk_index == 0 else chunk_body
            chunks.append({
                "chunk_index": chunk_index,
                "chunk_text": full_chunk.strip(),
                "token_count": _approx_tokens(full_chunk),
            })
            chunk_index += 1

            # Keep overlap: retain last N tokens worth of paragraphs
            overlap_chars: List[str] = []
            overlap_tokens = 0
            for p in reversed(current_chars):
                t = _approx_tokens(p)
                if overlap_tokens + t > CHUNK_OVERLAP:
                    break
                overlap_chars.insert(0, p)
                overlap_tokens += t
            current_chars = overlap_chars
            current_tokens = overlap_tokens

        # Paragraph itself bigger than chunk size → split by sentences
        if para_tokens > CHUNK_SIZE:
            sentences = para.replace(". ", ".\n").split("\n")
            for sent in sentences:
                st = _approx_tokens(sent)
                if current_tokens + st > CHUNK_SIZE and current_chars:
                    chunk_body = " ".join(current_chars)
                    full_chunk = (prefix + chunk_body) if chunk_index == 0 else chunk_body
                    chunks.append({
                        "chunk_index": chunk_index,
                        "chunk_text": full_chunk.strip(),
                        "token_count": _approx_tokens(full_chunk),
                    })
                    chunk_index += 1
                    current_chars = []
                    current_tokens = 0
                current_chars.append(sent)
                current_tokens += st
        else:
            current_chars.append(para)
            current_tokens += para_tokens

    # Flush remaining
    if current_chars:
        chunk_body = " ".join(current_chars)
        full_chunk = (prefix + chunk_body) if chunk_index == 0 else chunk_body
        chunks.append({
            "chunk_index": chunk_index,
            "chunk_text": full_chunk.strip(),
            "token_count": _approx_tokens(full_chunk),
        })

    return chunks
