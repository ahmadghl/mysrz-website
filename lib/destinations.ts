import { cache } from 'react';
import type { Destination, FaqItem } from './types';
import { resolveImageUrl } from './image-utils';

const REVALIDATE_SECONDS = 60;

interface DestinationRow {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  description: string | null;
  best_time: string | null;
  image_url: string | null;
  tags: string[] | string | null;
  sort_order: number | null;
  updated_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  faqs: unknown;
  image_credit_name: string | null;
  image_credit_instagram: string | null;
  image_credit_twitter: string | null;
  image_credit_website: string | null;
}

function normalizeFaqs(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((it): it is { q: unknown; a: unknown } => typeof it === 'object' && it !== null)
    .map((it) => ({
      q: typeof it.q === 'string' ? it.q.trim() : '',
      a: typeof it.a === 'string' ? it.a.trim() : '',
    }))
    .filter((it) => it.q.length > 0 && it.a.length > 0);
}

function normalize(row: DestinationRow): Destination {
  const tags = Array.isArray(row.tags)
    ? row.tags
    : typeof row.tags === 'string'
      ? row.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    region: row.region ?? '',
    description: row.description ?? '',
    best_time: row.best_time ?? '',
    image_url: resolveImageUrl(row.image_url ?? ''),
    tags,
    sort_order: row.sort_order ?? 0,
    updated_at: row.updated_at ?? null,
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    faqs: normalizeFaqs(row.faqs),
    image_credit:
      row.image_credit_name ||
      row.image_credit_instagram ||
      row.image_credit_twitter ||
      row.image_credit_website
        ? {
            name: row.image_credit_name ?? undefined,
            instagram: row.image_credit_instagram ?? undefined,
            twitter: row.image_credit_twitter ?? undefined,
            website: row.image_credit_website ?? undefined,
          }
        : undefined,
  };
}

async function fetchFromSupabase(slug?: string): Promise<Destination[] | null> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const select =
    'id,slug,name,region,description,best_time,image_url,tags,sort_order,updated_at,' +
    'meta_title,meta_description,faqs,' +
    'image_credit_name,image_credit_instagram,image_credit_twitter,image_credit_website';
  const filter = slug
    ? `&slug=eq.${encodeURIComponent(slug)}`
    : '&order=sort_order.asc,name.asc&limit=200';

  const apiUrl = `${url}/rest/v1/destinations?select=${select}&published=eq.true${filter}`;

  try {
    const r = await fetch(apiUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['destinations'] },
    });
    if (!r.ok) {
      console.error(
        '[destinations] Supabase fetch failed',
        r.status,
        await r.text().catch(() => ''),
      );
      return null;
    }
    const rows = (await r.json()) as DestinationRow[];
    if (!Array.isArray(rows)) return null;
    return rows.map(normalize);
  } catch (err) {
    console.error('[destinations] fetch error', err);
    return null;
  }
}

// Wrapped with React.cache() so the layout + page + sitemap share a
// single fetch per request. The inner fetch() still uses the data
// cache (60s TTL, 'destinations' tag) for cross-request caching
// invalidated by /api/revalidate.
export const getAllDestinations = cache(async (): Promise<Destination[]> => {
  return (await fetchFromSupabase()) ?? [];
});

export const getDestinationBySlug = cache(
  async (slug: string): Promise<Destination | null> => {
    const rows = await fetchFromSupabase(slug);
    return rows?.[0] ?? null;
  },
);

export async function getDestinationSlugs(): Promise<string[]> {
  const all = await getAllDestinations();
  return all.map((d) => d.slug);
}
