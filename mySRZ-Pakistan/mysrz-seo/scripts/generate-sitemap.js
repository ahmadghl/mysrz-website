/**
 * AUTO SITEMAP GENERATOR
 * Runs automatically on every Vercel build.
 * 
 * For blog posts: fetches from Supabase API if env vars present,
 * otherwise uses static post IDs as fallback.
 * 
 * Run manually: node scripts/generate-sitemap.js
 */

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://www.mysrztourism.com';
const TODAY = new Date().toISOString().split('T')[0];

// Static pages — always in sitemap
const STATIC_PAGES = [
  { path: '/',             priority: '1.0', changefreq: 'daily'   },
  { path: '/destinations', priority: '0.9', changefreq: 'weekly'  },
  { path: '/blog',         priority: '0.9', changefreq: 'daily'   },
  { path: '/about',        priority: '0.7', changefreq: 'monthly' },
  { path: '/contact',      priority: '0.7', changefreq: 'monthly' },
];

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function fetchBlogSlugs() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('⚠️  No Supabase env vars — using static post IDs as fallback');
    return [
      { slug: '1', date: TODAY },
      { slug: '2', date: TODAY },
      { slug: '3', date: TODAY },
      { slug: '4', date: TODAY },
      { slug: '5', date: TODAY },
    ];
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,id,created_at&status=eq.published&order=created_at.desc&limit=200`;
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!r.ok) throw new Error(`Supabase error: ${r.status}`);
    const posts = await r.json();
    console.log(`📝 Fetched ${posts.length} published posts from Supabase`);
    return posts.map(p => ({
      slug: p.slug || p.id,
      date: p.created_at ? p.created_at.split('T')[0] : TODAY,
    }));
  } catch (err) {
    console.error('Supabase fetch failed:', err.message);
    return [];
  }
}

async function generate() {
  console.log('🗺️  Generating sitemap...');

  const staticEntries = STATIC_PAGES.map(p =>
    urlEntry(`${BASE_URL}${p.path}`, TODAY, p.changefreq, p.priority)
  );

  const blogPosts = await fetchBlogSlugs();
  const blogEntries = blogPosts.map(p =>
    urlEntry(`${BASE_URL}/blog/${p.slug}`, p.date, 'monthly', '0.8')
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Core Pages -->
${staticEntries.join('\n')}

  <!-- Blog Posts (auto-generated from Supabase) -->
${blogEntries.join('\n')}

</urlset>`;

  const outPath = join(__dirname, '../public/sitemap.xml');
  await writeFile(outPath, xml, 'utf-8');
  console.log(`✅ sitemap.xml generated: ${STATIC_PAGES.length} pages + ${blogPosts.length} blog posts`);
  console.log(`📁 Saved to: public/sitemap.xml`);
}

generate().catch(err => {
  console.error('Sitemap generation failed:', err);
  process.exit(0); // Don't block the build
});
