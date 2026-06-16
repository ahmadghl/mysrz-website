
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
