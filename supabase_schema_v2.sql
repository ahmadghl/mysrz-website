-- ═══════════════════════════════════════════════════════════
--  WebCrawler — Schema additions
--  Run AFTER the base supabase_schema.sql
--  Adds: url_targets, page_embeddings, chat_sessions, chat_messages
-- ═══════════════════════════════════════════════════════════

-- Enable pgvector extension (for embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── URL Targets (managed list of domains/URLs to crawl daily) ─
CREATE TABLE IF NOT EXISTS url_targets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url         TEXT NOT NULL UNIQUE,
    label       TEXT,
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    crawl_mode  TEXT NOT NULL DEFAULT 'auto'
                  CHECK (crawl_mode IN ('static','dynamic','auto')),
    max_pages   INTEGER DEFAULT 5000,
    last_crawled_at TIMESTAMPTZ,
    last_job_id UUID REFERENCES crawl_jobs(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER url_targets_updated_at
    BEFORE UPDATE ON url_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Page embeddings (vector store for RAG) ────────────────────
CREATE TABLE IF NOT EXISTS page_embeddings (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id      UUID NOT NULL REFERENCES crawled_pages(id) ON DELETE CASCADE,
    job_id       UUID NOT NULL REFERENCES crawl_jobs(id) ON DELETE CASCADE,
    url          TEXT NOT NULL,
    title        TEXT,
    chunk_index  INTEGER NOT NULL DEFAULT 0,
    chunk_text   TEXT NOT NULL,
    embedding    vector(1536),          -- OpenAI text-embedding-3-small dimension
    token_count  INTEGER,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_embeddings_page_id ON page_embeddings(page_id);
CREATE INDEX idx_embeddings_job_id  ON page_embeddings(job_id);

-- IVFFlat index for fast ANN vector search (build after inserting data)
-- CREATE INDEX idx_embeddings_vector ON page_embeddings
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Semantic search function (called by RAG API) ──────────────
CREATE OR REPLACE FUNCTION match_page_chunks(
    query_embedding vector(1536),
    match_count     INT DEFAULT 8,
    match_threshold FLOAT DEFAULT 0.70
)
RETURNS TABLE (
    id          UUID,
    page_id     UUID,
    url         TEXT,
    title       TEXT,
    chunk_index INT,
    chunk_text  TEXT,
    similarity  FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.id,
        pe.page_id,
        pe.url,
        pe.title,
        pe.chunk_index,
        pe.chunk_text,
        1 - (pe.embedding <=> query_embedding) AS similarity
    FROM page_embeddings pe
    WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ── Chat sessions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title      TEXT NOT NULL DEFAULT 'New chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Chat messages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
    content     TEXT NOT NULL,
    sources     JSONB,      -- array of {url, title, similarity} references
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON chat_messages(session_id);
CREATE INDEX idx_messages_created ON chat_messages(created_at DESC);

-- ── RLS policies ──────────────────────────────────────────────
ALTER TABLE url_targets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_embeddings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_url_targets"     ON url_targets      FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_embeddings"      ON page_embeddings  FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_chat_sessions"   ON chat_sessions    FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_chat_messages"   ON chat_messages    FOR ALL TO service_role USING (true);

-- ── Add body column to crawled_pages (for embedding storage) ──
ALTER TABLE crawled_pages ADD COLUMN IF NOT EXISTS body TEXT;
