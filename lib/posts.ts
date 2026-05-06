import type { Post } from './types';
import { STATIC_POSTS } from './static-posts';
import { slugify } from './utils';

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
  read_time: number | null;
  views: number | null;
  image_credit_name: string | null;
  image_credit_instagram: string | null;
  image_credit_twitter: string | null;
  image_credit_website: string | null;
}

function normalize(row: SupabasePostRow): Post {
  const slug = row.slug && row.slug.trim().length > 0 ? row.slug : slugify(row.title);
  return {
    id: row.id,
    slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content: row.content ?? '',
    image_url: row.image_url || `https://picsum.photos/seed/${slug}/1200/800`,
    category: (row.category as Post['category']) ?? 'Adventure',
    author: row.author ?? 'Ahmad Fraz',
    created_at: row.created_at ?? new Date().toISOString(),
    read_time: row.read_time ?? 5,
    views: row.views ?? 0,
    image_credit_name: row.image_credit_name ?? null,
    image_credit_instagram: row.image_credit_instagram ?? null,
    image_credit_twitter: row.image_credit_twitter ?? null,
    image_credit_website: row.image_credit_website ?? null,
  };
}

async function fetchFromSupabase(): Promise<Post[] | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const apiUrl =
    `${url}/rest/v1/blog_posts` +
    `?select=id,slug,title,excerpt,content,image_url,category,author,created_at,read_time,views,image_credit_name,image_credit_instagram,image_credit_twitter,image_credit_website` +
    `&status=eq.published` +
    `&order=created_at.desc` +
    `&limit=200`;

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
      console.error('Supabase fetch failed', r.status, await r.text().catch(() => ''));
      return null;
    }
    const rows = (await r.json()) as SupabasePostRow[];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    return rows.map(normalize);
  } catch (err) {
    console.error('Supabase fetch error', err);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const remote = await fetchFromSupabase();
  if (remote && remote.length > 0) return remote;
  return STATIC_POSTS;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const all = await getAllPosts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedPosts(slug: string, limit = 4): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.slug !== slug).slice(0, limit);
}
