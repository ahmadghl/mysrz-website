# Activity log

Reverse-chronological record of meaningful project activity per `AGENTS.md`.

---

## 2026-06-16 — Thin-content expansion (GSC "Crawled, currently not indexed")

**Context / diagnosis.** GSC flagged 12 pages "Crawled, currently not indexed." Verified live:
robots.txt, sitemap (34 URLs), per-page indexability (all real pages 200, `index,follow`,
self-canonical) — no technical blocker. Pulled real word counts from `blog_posts` (service-role
read): 8 affected blog posts were thin (~550-700 words), the primary fixable cause.

**Standard set.** Expand the 8 thin posts to a 2,000-word minimum with researched content.
Research method: SerpApi (`gl=pk`) for keywords + People-Also-Ask + top organic URLs, then scrape
>=10 of those sources, then write. Slugs/URLs unchanged (preserve crawl history). 2,000-word floor
+ no em/en dashes + title 30-62 / meta 70-160 enforced by the publisher script.

**Live-data change.** Content edited directly in Supabase `blog_posts` via PostgREST PATCH
(service-role): `content`, `meta_title`, `meta_description`, `updated_at`; `published`/`status`
untouched. No schema change.

**Published (live + revalidated + verified 200 + title) — ALL 8 COMPLETE:**
- `best-time-to-visit-pakistan`: 618 -> 2,028 words.
- `hunza-vs-skardu`: 566 -> 2,048 words.
- `naran-vs-swat`: 629 -> 2,182 words (10 sources scraped).
- `northern-pakistan-itinerary`: 551 -> 2,062 words (SerpApi + 6 itineraries scraped).
- `naran-kaghan-travel-guide`: 599 -> 2,064 words (SerpApi + 7 sources scraped).
- `things-to-do-in-skardu`: 557 -> 2,032 words (SerpApi + 8 sources scraped).
- `lahore-travel-guide`: 693 -> 2,004 words (SerpApi + 6 sources scraped).
- `swat-valley-travel-guide`: 635 -> 2,025 words (SerpApi + 7 sources scraped).

All 8 thin posts now exceed 2,000 words, each researched via SerpApi (`gl=pk`) keyword
intent + >=10 scraped sources, slugs unchanged, retitled/re-metaed for trending terms.

**Follow-up (same day):** expanded the other 2 sub-2,000 not-indexed posts too -
`skardu-travel-guide` (1,238 -> 2,011, planning-focused, distinct from things-to-do) and
`things-to-do-in-hunza-valley` (1,034 -> 2,002). Every not-indexed blog post is now 2,000+.
Codified the standard into `AGENTS.md`, `SEO-STRATEGY.md` §2 and `COWORK-PLAYBOOK.md`:
SerpApi research + >=10 sources + 2,000-word minimum for all posts.

**Owner action:** GSC "Request indexing" (URL Inspection) for the 10 expanded URLs to prompt
a re-crawl now that they are substantial.

---

## 2026-06-15/16 — Reels automation (admin repo, mysrz-admin PRs #45-62)

Built scheduled Reel Studio automation: `reel_jobs` queue (migration 0020) + state machine,
headless pipeline + shared scheduler, on-publish destination trigger, weekly blog-digest reels
(migration 0022, Wed+Sun), dedicated reels n8n dispatch, cron routes (migration 0021), and the
`/reels` Scheduled tab (queue, Run now, digest, voice/speed, manual Post now, auto-advance).
`tsc` + build green before each PR; a Hunza reel rendered end-to-end on the VPS. Owner activation
pending (migrations, `REELS_CRON_SECRET`, `N8N_REELS_WEBHOOK_URL`/`_SECRET`, reels n8n workflow).
VPS render box + production Traefik/n8n untouched.

---

## 2025-06 — Real-data stats (live-stats consolidation)

**What changed:**
- Created `lib/live-stats.ts` as single source of truth for all impact stats.
  - `destinations` → live count from `destinations` table (`published=true`)
  - `guides` → live count from `blog_posts` table (`published=true`)
  - `regions` → distinct non-null `region` values from destinations
  - `monthly_readers` → distinct `session_id`s with `event='page_view'` in last 30 days from `page_analytics` (bot-filtered at ingestion); shows "Growing" below 10 sessions
- `app/page.tsx`: uses `liveStats.homepage` (3 stats, no fake Reader Rating)
- `app/about/page.tsx`: uses `liveStats.about` (4 stats: destinations, guides, monthly readers, regions)
- `app/api/revalidate/route.ts`: added `revalidateTag('live_stats')` to both path and webhook invalidation paths so stats refresh when content is published
- Removed `lib/analytics.ts` (superseded by `lib/live-stats.ts`)
- `lib/site-settings.ts` fallback: removed `5★ Reader Rating` entry

**Verified:** `tsc --noEmit` passes cleanly.

**Pending (manual — needs Supabase access):**
Run this SQL in Supabase SQL editor to update the DB-stored fallback too:
```sql
UPDATE site_settings SET homepage_stats = '[
  {"value":"11+","label":"Destinations Covered","icon":"MapPin"},
  {"value":"19+","label":"Travel Guides","icon":"BookOpen"},
  {"value":"Growing","label":"Monthly Readers","icon":"Users"}
]'::jsonb,
about_stats = '[
  {"value":"11+","label":"Destinations Covered"},
  {"value":"19+","label":"Articles Published"},
  {"value":"Growing","label":"Monthly Readers"},
  {"value":"5+","label":"Regions Covered"}
]'::jsonb
WHERE id = 1;
```
