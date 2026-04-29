-- ═══════════════════════════════════════════════════════════════════════════
--  mySRZ Travel & Tourism — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast full-text search on title/content

-- ── ENUM: post status ───────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── ENUM: category ──────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE post_category AS ENUM ('Adventure', 'Culture', 'Food', 'Nature', 'Other');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE: blog_posts
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS blog_posts (
  -- Identity
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT          UNIQUE NOT NULL,         -- URL-friendly identifier e.g. "k2-base-camp-trek"

  -- Content
  title         TEXT          NOT NULL,
  excerpt       TEXT          NOT NULL,                -- Short summary shown on cards (1–2 sentences)
  content       TEXT          NOT NULL,                -- Full Markdown body
  image_url     TEXT,                                  -- Hero image URL (Unsplash, Cloudinary, etc.)
  image_alt     TEXT,                                  -- Alt text for accessibility / SEO

  -- Taxonomy
  category      post_category NOT NULL DEFAULT 'Other',
  tags          TEXT[]        DEFAULT '{}',            -- e.g. {"Karakoram","Trekking","Gilgit-Baltistan"}

  -- Authorship
  author        TEXT          NOT NULL DEFAULT 'Ahmad Fraz',
  author_email  TEXT,

  -- Publishing
  status        post_status   NOT NULL DEFAULT 'draft',
  published_at  TIMESTAMPTZ,                           -- Set when status → published
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Stats (updated by your n8n workflow or triggers)
  views         INTEGER       NOT NULL DEFAULT 0,
  read_time     INTEGER       NOT NULL DEFAULT 5,      -- estimated minutes

  -- SEO overrides (optional — used by future SSR/meta tag generation)
  seo_title     TEXT,
  seo_desc      TEXT,
  seo_image     TEXT,

  -- n8n workflow metadata
  n8n_run_id    TEXT,                                  -- store the n8n execution ID for traceability
  ai_generated  BOOLEAN       NOT NULL DEFAULT FALSE   -- flag if content was AI-drafted
);

-- ── Auto-update updated_at on every row change ───────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Auto-set published_at when status becomes 'published' ───────────────────
CREATE OR REPLACE FUNCTION set_published_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = COALESCE(NEW.published_at, NOW());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_published_at ON blog_posts;
CREATE TRIGGER blog_posts_published_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

-- ═══════════════════════════════════════════════════════════════════════════
--  INDEXES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_blog_posts_status         ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category       ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at     ON blog_posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at   ON blog_posts (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug           ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags           ON blog_posts USING GIN (tags);

-- Full-text search index across title + excerpt
CREATE INDEX IF NOT EXISTS idx_blog_posts_search
  ON blog_posts USING GIN (to_tsvector('english', title || ' ' || excerpt));

-- ═══════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts only
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Service role (your n8n workflow) can do everything
-- n8n must use SUPABASE_SERVICE_ROLE_KEY (not anon key) to insert/update
DROP POLICY IF EXISTS "Service role full access" ON blog_posts;
CREATE POLICY "Service role full access"
  ON blog_posts FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE: newsletter_subscribers
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT          UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  source        TEXT          DEFAULT 'website',       -- "website", "blog_post", etc.
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- n8n service role inserts subscribers
DROP POLICY IF EXISTS "Service role manages subscribers" ON newsletter_subscribers;
CREATE POLICY "Service role manages subscribers"
  ON newsletter_subscribers FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
--  TABLE: contact_submissions
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS contact_submissions (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     TEXT          NOT NULL,
  email         TEXT          NOT NULL,
  phone         TEXT,
  subject       TEXT          NOT NULL,
  message       TEXT          NOT NULL,
  submitted_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  page_url      TEXT,
  referrer      TEXT,
  is_read       BOOLEAN       NOT NULL DEFAULT FALSE
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages contacts" ON contact_submissions;
CREATE POLICY "Service role manages contacts"
  ON contact_submissions FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════════════════
--  USEFUL VIEWS
-- ═══════════════════════════════════════════════════════════════════════════

-- Published posts summary (used by the /api/posts endpoint)
CREATE OR REPLACE VIEW published_posts AS
  SELECT
    id, slug, title, excerpt, image_url, image_alt,
    category, tags, author, published_at AS created_at,
    views, read_time, seo_title, seo_desc
  FROM blog_posts
  WHERE status = 'published'
  ORDER BY published_at DESC;

-- ═══════════════════════════════════════════════════════════════════════════
--  SAMPLE DATA — remove before production
-- ═══════════════════════════════════════════════════════════════════════════
/*
INSERT INTO blog_posts (slug, title, excerpt, content, image_url, category, status, read_time, ai_generated)
VALUES (
  'hunza-valley-guide',
  'Hunza Valley: Paradise Found in the Karakoram',
  'Nestled between three great mountain ranges, Hunza is Pakistan''s most photographed destination.',
  '# Hunza Valley...\n\nFull markdown content here.',
  'https://images.unsplash.com/photo-hunza?w=800',
  'Nature',
  'published',
  9,
  false
);
*/

-- ═══════════════════════════════════════════════════════════════════════════
--  DONE
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'mySRZ schema created successfully ✓' AS result;
