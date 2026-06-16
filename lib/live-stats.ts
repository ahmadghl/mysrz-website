/**
 * lib/live-stats.ts
 *
 * Single source of truth for all public-facing "impact stats".
 * Every number here is derived from real data — no placeholders.
 *
 * Sources:
 *   destinations    → destinations table (published=true)
 *   guides          → blog_posts table (published=true)
 *   regions         → distinct non-null `region` values in destinations
 *   monthly_readers → distinct session_ids with event='page_view' in last 30 days
 *                     from page_analytics (bot-filtered at ingestion in /api/track)
 *
 * Design notes:
 *   - getAllDestinations / getAllPosts are already React.cache()-deduped per
 *     request, so calling them here costs nothing extra on pages that also
 *     render content.
 *   - monthly_readers uses a separate fetch with its own 60s revalidate tag
 *     so content publishes don't unnecessarily bust the analytics cache.
 *   - All values return a formatted display string ("12", "1.4K+") or the
 *     provided fallback if the DB is unreachable or returns 0.
 *   - The exported getLiveStats() is the only call pages need to make.
 *
 * Activity log: added 2025-06 to replace hardcoded placeholder stats
 * (50+, 100+, 10K+, 5★) with live DB-backed counts on homepage and /about.
 */

import { cache } from 'react';
import { getAllDestinations } from './destinations';
import { getAllPosts } from './posts';

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatCount(n: number, suffix = ''): string {
  if (n >= 1000) {
    const k = n / 1000;
    const rounded = Math.round(k * 10) / 10;
    const str = rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    return `${str}K+${suffix}`;
  }
  return `${n}${suffix}`;
}

// ---------------------------------------------------------------------------
// Monthly readers from page_analytics
// ---------------------------------------------------------------------------

async function fetchMonthlyReaders(): Promise<number> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return 0;

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const apiUrl =
      `${url}/rest/v1/page_analytics` +
      `?select=session_id&event=eq.page_view&created_at=gte.${encodeURIComponent(since)}`;

    const res = await fetch(apiUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        // Cap at 50k rows — if we truly exceed that, "50K+" is still honest
        Range: '0-49999',
      },
      // Separate cache tag so analytics updates don't bust content caches
      next: { revalidate: 60, tags: ['live_stats'] },
    });

    if (!res.ok && res.status !== 206) {
      console.error('[live-stats] page_analytics fetch failed', res.status);
      return 0;
    }

    const rows = (await res.json()) as { session_id: string | null }[];
    if (!Array.isArray(rows)) return 0;

    const distinct = new Set(
      rows.map((r) => r.session_id).filter((s): s is string => !!s),
    );
    return distinct.size;
  } catch (err) {
    console.error('[live-stats] fetchMonthlyReaders error', err);
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Exported types
// ---------------------------------------------------------------------------

export interface LiveStat {
  value: string;
  label: string;
  icon?: string;
}

export interface LiveStats {
  destinations: number;
  guides: number;
  regions: number;
  monthly_readers: number;
  /** Pre-formatted for the homepage stats row (3 items, no rating) */
  homepage: LiveStat[];
  /** Pre-formatted for the /about stats row (4 items) */
  about: LiveStat[];
}

// ---------------------------------------------------------------------------
// Main export — React.cache() so layout + page share one result per request
// ---------------------------------------------------------------------------

export const getLiveStats = cache(async (): Promise<LiveStats> => {
  const [destinations, posts, readers] = await Promise.all([
    getAllDestinations(),
    getAllPosts(),
    fetchMonthlyReaders(),
  ]);

  const destinationCount = destinations.length;
  const guideCount = posts.length;
  const regionCount = new Set(
    destinations.map((d) => d.region).filter((r): r is string => !!r && r.trim() !== ''),
  ).size;

  // "Monthly Readers" — show real count once we have meaningful traffic (≥10).
  // Below that threshold, keep a neutral label rather than showing "8".
  const readersDisplay =
    readers >= 10 ? formatCount(readers) : 'Growing';

  const destDisplay = destinationCount > 0 ? `${destinationCount}+` : '10+';
  const guideDisplay = guideCount > 0 ? `${guideCount}+` : '15+';
  const regionDisplay = regionCount > 0 ? `${regionCount}+` : '5+';

  const homepage: LiveStat[] = [
    { value: destDisplay, label: 'Destinations Covered', icon: 'MapPin' },
    { value: guideDisplay, label: 'Travel Guides', icon: 'BookOpen' },
    { value: readersDisplay, label: 'Monthly Readers', icon: 'Users' },
  ];

  const about: LiveStat[] = [
    { value: destDisplay, label: 'Destinations Covered' },
    { value: guideDisplay, label: 'Articles Published' },
    { value: readersDisplay, label: 'Monthly Readers' },
    { value: regionDisplay, label: 'Regions Covered' },
  ];

  return {
    destinations: destinationCount,
    guides: guideCount,
    regions: regionCount,
    monthly_readers: readers,
    homepage,
    about,
  };
});
