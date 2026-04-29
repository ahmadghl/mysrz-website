-- ═══════════════════════════════════════════════════
--  Web Crawler — Supabase Schema
--  Run this in your Supabase SQL editor
-- ═══════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Crawl Jobs ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS crawl_jobs (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain                TEXT NOT NULL,
    name                  TEXT,
    status                TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','running','paused','completed','failed','cancelled')),
    mode                  TEXT NOT NULL DEFAULT 'auto'
                            CHECK (mode IN ('static','dynamic','auto')),
    max_pages             INTEGER,
    crawl_delay           FLOAT NOT NULL DEFAULT 1.0,
    max_depth             INTEGER,
    follow_external_links BOOLEAN NOT NULL DEFAULT FALSE,
    respect_robots_txt    BOOLEAN NOT NULL DEFAULT TRUE,
    include_patterns      TEXT[],
    exclude_patterns      TEXT[],
    schedule_cron         TEXT,
    tags                  TEXT[],
    pages_crawled         INTEGER NOT NULL DEFAULT 0,
    pages_found           INTEGER NOT NULL DEFAULT 0,
    pages_failed          INTEGER NOT NULL DEFAULT 0,
    bytes_downloaded      BIGINT NOT NULL DEFAULT 0,
    error_message         TEXT,
    started_at            TIMESTAMPTZ,
    completed_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crawl_jobs_status   ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_domain   ON crawl_jobs(domain);
CREATE INDEX idx_crawl_jobs_created  ON crawl_jobs(created_at DESC);

-- ── Crawled Pages ───────────────────────────────────
CREATE TABLE IF NOT EXISTS crawled_pages (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id        UUID NOT NULL REFERENCES crawl_jobs(id) ON DELETE CASCADE,
    url           TEXT NOT NULL,
    title         TEXT,
    status_code   INTEGER,
    content_type  TEXT,
    word_count    INTEGER DEFAULT 0,
    links_found   INTEGER DEFAULT 0,
    depth         INTEGER DEFAULT 0,
    load_time_ms  INTEGER,
    error         TEXT,
    crawled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pages_job_id    ON crawled_pages(job_id);
CREATE INDEX idx_pages_url       ON crawled_pages(url);
CREATE INDEX idx_pages_status    ON crawled_pages(status_code);
CREATE INDEX idx_pages_crawled   ON crawled_pages(crawled_at DESC);

-- ── Auto-update updated_at trigger ─────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crawl_jobs_updated_at
    BEFORE UPDATE ON crawl_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Stats view ──────────────────────────────────────
CREATE OR REPLACE VIEW crawl_stats AS
SELECT
    COUNT(*)                                          AS total_jobs,
    COUNT(*) FILTER (WHERE status IN ('running','pending')) AS active_jobs,
    SUM(pages_crawled)                                AS total_pages_crawled,
    COUNT(DISTINCT domain)                            AS total_domains,
    SUM(bytes_downloaded)                             AS total_bytes_downloaded,
    COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS jobs_today
FROM crawl_jobs;

-- ── RLS Policies (enable for production) ───────────
ALTER TABLE crawl_jobs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawled_pages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by backend)
CREATE POLICY "service_role_all_jobs"  ON crawl_jobs    FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_all_pages" ON crawled_pages FOR ALL TO service_role USING (true);
