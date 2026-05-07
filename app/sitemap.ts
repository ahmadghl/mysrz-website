import type { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';
import { SITE } from '@/lib/utils';

export const revalidate = 3600;

async function getDestinationSlugs(): Promise<string[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/destinations?select=slug&published=eq.true`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const rows: { slug: string }[] = await res.json();
    return rows.map((r) => r.slug);
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`,            lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE.url}/destinations`,lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE.url}/blog`,        lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE.url}/about`,       lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE.url}/contact`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const [posts, destSlugs] = await Promise.all([getAllPosts(), getDestinationSlugs()]);

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const destRoutes: MetadataRoute.Sitemap = destSlugs.map((slug) => ({
    url: `${SITE.url}/destinations/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...destRoutes, ...postRoutes];
}
