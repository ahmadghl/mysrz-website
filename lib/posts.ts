import type { Post, FaqItem } from './types';
import { slugify } from './utils';
import { resolveImageUrl } from './image-utils';

const REVALIDATE_SECONDS = 60;

interface SupabasePostRow {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: Post['category'] | null;
  author: string | null;
  created_at: string | null;
  updated_at: string | null;
  read_time: number | null;
  views: number | null;
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

function normalize(row: SupabasePostRow): Post {
  const slug = row.slug && row.slug.trim().length > 0 ? row.slug : slugify(row.title);
  return {
    id: row.id,
    slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    image_url: resolveImageUrl(row.image_url ?? ''),
    category: (row.category as Post['category']) ?? 'Adventure',
    author: row.author ?? 'Ahmad Fraz',
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? null,
    read_time: row.read_time ?? 5,
    views: row.views ?? 0,
    meta_title: row.meta_title ?? null,
    meta_description: row.meta_description ?? null,
    faqs: normalizeFaqs(row.faqs),
    image_credit_name: row.image_credit_name ?? null,
    image_credit_instagram: row.image_credit_instagram ?? null,
    image_credit_twitter: row.image_credit_twitter ?? null,
    image_credit_website: row.image_credit_website ?? null,
  };
}

async function fetchFromSupabase(slug?: string): Promise<Post[] | null> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const select =
    'id,slug,title,excerpt,content,image_url,category,author,created_at,updated_at,read_time,views,' +
    'meta_title,meta_description,faqs,image_credit_name,image_credit_instagram,image_credit_twitter,image_credit_website';
  const filter = slug
    ? `&slug=eq.${encodeURIComponent(slug)}`
    : '&order=created_at.desc&limit=200';

  const apiUrl = `${url}/rest/v1/blog_posts?select=${select}&published=eq.true${filter}`;

  try {
    const r = await fetch(apiUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['posts'] },
    });
    if (!r.ok) {
      console.error(
        '[posts] Supabase fetch failed',
        r.status,
        await r.text().catch(() => ''),
      );
      return null;
    }
    const rows = (await r.json()) as SupabasePostRow[];
    if (!Array.isArray(rows)) return null;
    return rows.map(normalize);
  } catch (err) {
    console.error('[posts] fetch error', err);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  return (await fetchFromSupabase()) ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await fetchFromSupabase(slug);
  return rows?.[0] ?? null;
}

export async function getRelatedPosts(slug: string, limit = 4): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.slug !== slug).slice(0, limit);
}

export async function getPostSlugs(): Promise<string[]> {
  const all = await getAllPosts();
  return all.map((p) => p.slug);
}
