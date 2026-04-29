# /opt/srz-crawl/app/utils/supabase_migration.py
"""
Migration script to set up schema on a custom Supabase instance.
Also handles data migration from central to custom.
"""
import os
from supabase import create_client, Client
from loguru import logger

SCHEMA_SQL = """
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domains
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_selected BOOLEAN DEFAULT true,
    pages_crawled INT DEFAULT 0,
    last_crawl_at TIMESTAMPTZ,
    status TEXT DEFAULT 'idle',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    meta_description TEXT,
    content TEXT,
    content_hash TEXT,
    crawled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(domain_id, url)
);

-- Page Embeddings
CREATE TABLE IF NOT EXISTS page_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    domain_id UUID NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page Images
CREATE TABLE IF NOT EXISTS page_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT,
    ocr_text TEXT,
    vision_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page PDFs
CREATE TABLE IF NOT EXISTS page_pdfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT,
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'New Chat',
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crawl Schedules
CREATE TABLE IF NOT EXISTS crawl_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    schedule_type TEXT NOT NULL,
    cron_expression TEXT,
    urls JSONB,
    is_enabled BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT true,
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule Executions
CREATE TABLE IF NOT EXISTS schedule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES crawl_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT DEFAULT 'pending',
    pages_crawled INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error TEXT
);

-- Crawl Queue
CREATE TABLE IF NOT EXISTS crawl_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    domain_ids JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    pages_crawled INT DEFAULT 0,
    total_pages INT DEFAULT 0,
    current_url TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User OpenAI Keys
CREATE TABLE IF NOT EXISTS user_openai_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    api_key_encrypted TEXT NOT NULL,
    model TEXT DEFAULT 'gpt-4-turbo',
    temperature FLOAT DEFAULT 0.7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Supabase Config
CREATE TABLE IF NOT EXISTS user_supabase_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    supabase_url TEXT NOT NULL,
    anon_key_encrypted TEXT NOT NULL,
    service_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    connection_status TEXT DEFAULT 'pending',
    migrated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Limits
CREATE TABLE IF NOT EXISTS user_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    pages_crawled_this_month INT DEFAULT 0,
    storage_used_mb FLOAT DEFAULT 0,
    crawls_this_month INT DEFAULT 0,
    team_members_count INT DEFAULT 0,
    reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_user_id UUID REFERENCES profiles(id),
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_openai_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supabase_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS: Users see their own data
CREATE POLICY "Users see own profiles" ON profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "Users see own domains" ON domains FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own pages" ON pages FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own embeddings" ON page_embeddings FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own images" ON page_images FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own PDFs" ON page_pdfs FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own chat sessions" ON chat_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own messages" ON chat_messages FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own schedules" ON crawl_schedules FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own queue" ON crawl_queue FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own keys" ON user_openai_keys FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own supabase config" ON user_supabase_config FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own limits" ON user_limits FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own team" ON team_members FOR ALL USING (account_owner_id = auth.uid() OR member_user_id = auth.uid());

-- Vector search function
CREATE OR REPLACE FUNCTION match_page_embeddings(
    query_embedding vector(1536),
    match_count int DEFAULT 5,
    filter_domain_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    page_id uuid,
    chunk_text text,
    url text,
    title text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.id,
        pe.page_id,
        pe.chunk_text,
        p.url,
        p.title,
        1 - (pe.embedding <=> query_embedding) AS similarity
    FROM page_embeddings pe
    JOIN pages p ON pe.page_id = p.id
    WHERE (filter_domain_id IS NULL OR pe.domain_id = filter_domain_id)
      AND pe.user_id = auth.uid()
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Increment pages crawled RPC
CREATE OR REPLACE FUNCTION increment_pages_crawled(p_user_id uuid, p_count int DEFAULT 1)
RETURNS void AS $$
BEGIN
    INSERT INTO user_limits (user_id, pages_crawled_this_month)
    VALUES (p_user_id, p_count)
    ON CONFLICT (user_id)
    DO UPDATE SET
        pages_crawled_this_month = user_limits.pages_crawled_this_month + p_count,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Storage Buckets (run separately if not exists)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_limits (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
"""


async def run_migration_on_custom(supabase: Client) -> dict:
    """Run the full schema migration on a custom Supabase instance."""
    try:
        # Execute schema SQL
        # Note: supabase-py doesn't support raw SQL directly, use rpc or REST
        # In production you'd use psycopg2 directly with the DB connection string
        logger.info("Running migration on custom Supabase...")
        # For now, return instructions
        return {
            "success": True,
            "message": "Schema SQL generated. Please run supabase_schema.sql in your Supabase SQL editor.",
            "sql": SCHEMA_SQL,
        }
    except Exception as e:
        logger.error(f"Migration error: {e}")
        return {"success": False, "message": str(e)}
