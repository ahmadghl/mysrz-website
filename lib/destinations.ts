import type { Destination } from './types';
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
  image_credit_name: string | null;
  image_credit_instagram: string | null;
  image_credit_twitter: string | null;
  image_credit_website: string | null;
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
    'id,slug,name,region,description,best_time,image_url,tags,sort_order,' +
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

export async function getAllDestinations(): Promise<Destination[]> {
  return (await fetchFromSupabase()) ?? [];
}

export async function getDestinationBySlug(
  slug: string,
): Promise<Destination | null> {
  const rows = await fetchFromSupabase(slug);
  return rows?.[0] ?? null;
}

export async function getDestinationSlugs(): Promise<string[]> {
  const all = await getAllDestinations();
  return all.map((d) => d.slug);
}
