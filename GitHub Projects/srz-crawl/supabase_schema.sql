-- supabase_schema.sql
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Run in order; safe to re-run (uses IF NOT EXISTS / OR REPLACE)

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    subscription_tier TEXT DEFAULT 'free'
        CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Domains ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_selected BOOLEAN DEFAULT true,
    pages_crawled INT DEFAULT 0,
    last_crawl_at TIMESTAMPTZ,
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'crawling', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, url)
);

-- ─── Pages ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    meta_description TEXT,
    content TEXT,
    content_hash TEXT,
    crawled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(domain_id, url)
);
CREATE INDEX IF NOT EXISTS idx_pages_domain_id ON pages(domain_id);
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON pages(user_id);

-- ─── Page Embeddings ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    domain_id UUID NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_id, chunk_index)
);
CREATE INDEX IF NOT EXISTS idx_embeddings_domain ON page_embeddings(domain_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_user ON page_embeddings(user_id);

-- ─── Page Images ─────────────────────────────────────────────────────────────
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

-- ─── Page PDFs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_pdfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT,
    extracted_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Chat Sessions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'New Chat',
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions(user_id);

-- ─── Chat Messages ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sources JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);

-- ─── Crawl Schedules ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crawl_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('hourly','12_hours','daily','weekly','monthly','custom')),
    cron_expression TEXT,
    urls JSONB,
    is_enabled BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT true,
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Schedule Executions ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES crawl_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','completed','failed')),
    pages_crawled INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error TEXT
);

-- ─── Crawl Queue ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crawl_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain_ids JSONB NOT NULL DEFAULT '[]',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','running','completed','stopped','failed')),
    pages_crawled INT DEFAULT 0,
    total_pages INT DEFAULT 0,
    current_url TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_queue_user ON crawl_queue(user_id);

-- ─── User OpenAI Keys ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_openai_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    api_key_encrypted TEXT NOT NULL DEFAULT '',
    model TEXT DEFAULT 'gpt-4-turbo',
    temperature FLOAT DEFAULT 0.7,
    system_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ─── User Supabase Config ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_supabase_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    supabase_url TEXT NOT NULL,
    anon_key_encrypted TEXT NOT NULL,
    service_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    connection_status TEXT DEFAULT 'pending',
    migrated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ─── User Limits ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pages_crawled_this_month INT DEFAULT 0,
    storage_used_mb FLOAT DEFAULT 0,
    crawls_this_month INT DEFAULT 0,
    team_members_count INT DEFAULT 0,
    reset_at TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ─── Team Members ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    member_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','editor','viewer')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','active','revoked')),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(account_owner_id, email)
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_openai_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supabase_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies safely
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END$$;

-- Profiles
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (id = auth.uid());
-- Domains
CREATE POLICY "domains_own" ON domains FOR ALL USING (user_id = auth.uid());
-- Pages
CREATE POLICY "pages_own" ON pages FOR ALL USING (user_id = auth.uid());
-- Embeddings
CREATE POLICY "embeddings_own" ON page_embeddings FOR ALL USING (user_id = auth.uid());
-- Images
CREATE POLICY "images_own" ON page_images FOR ALL USING (user_id = auth.uid());
-- PDFs
CREATE POLICY "pdfs_own" ON page_pdfs FOR ALL USING (user_id = auth.uid());
-- Chat sessions
CREATE POLICY "sessions_own" ON chat_sessions FOR ALL USING (user_id = auth.uid());
-- Chat messages
CREATE POLICY "messages_own" ON chat_messages FOR ALL USING (user_id = auth.uid());
-- Schedules
CREATE POLICY "schedules_own" ON crawl_schedules FOR ALL USING (user_id = auth.uid());
-- Schedule executions
CREATE POLICY "executions_own" ON schedule_executions FOR ALL USING (user_id = auth.uid());
-- Queue
CREATE POLICY "queue_own" ON crawl_queue FOR ALL USING (user_id = auth.uid());
-- OpenAI keys
CREATE POLICY "openai_keys_own" ON user_openai_keys FOR ALL USING (user_id = auth.uid());
-- Supabase config
CREATE POLICY "supabase_config_own" ON user_supabase_config FOR ALL USING (user_id = auth.uid());
-- Limits
CREATE POLICY "limits_own" ON user_limits FOR ALL USING (user_id = auth.uid());
-- Team members (owner or member can see)
CREATE POLICY "team_access" ON team_members FOR ALL
    USING (account_owner_id = auth.uid() OR member_user_id = auth.uid());

-- ─── Vector Search Function ───────────────────────────────────────────────────
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
LANGUAGE plpgsql SECURITY DEFINER
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

-- ─── Increment Pages RPC ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_pages_crawled(p_user_id uuid, p_count int DEFAULT 1)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_limits (user_id, pages_crawled_this_month, crawls_this_month)
    VALUES (p_user_id, p_count, 0)
    ON CONFLICT (user_id)
    DO UPDATE SET
        pages_crawled_this_month = user_limits.pages_crawled_this_month + p_count,
        updated_at = NOW();
END;
$$;

-- ─── Auto-create Profile Trigger ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_limits (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─── Storage Buckets ─────────────────────────────────────────────────────────
-- Run these if buckets don't exist yet:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('images', 'images', false, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
    ('pdfs',   'pdfs',   false, 52428800, ARRAY['application/pdf']),
    ('uploads','uploads',false, 10485760, NULL)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "images_user_access" ON storage.objects FOR ALL
    USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "pdfs_user_access" ON storage.objects FOR ALL
    USING (bucket_id = 'pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "uploads_user_access" ON storage.objects FOR ALL
    USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Done!
SELECT 'SRZ Crawl schema installed successfully' AS status;
