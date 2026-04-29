// api/posts.js — Vercel serverless function
// Fetches published blog posts from Supabase and returns them to the frontend.
// Falls back gracefully if env vars are missing.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600'); // 5-min CDN cache

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(200).json([]); // graceful fallback — frontend uses static posts
  }

  try {
    // Fetch published posts, newest first, with a reasonable limit
    const apiUrl =
      `${SUPABASE_URL}/rest/v1/blog_posts` +
      `?select=id,title,excerpt,content,image_url,category,author,created_at,read_time,views,slug` +
      `&status=eq.published` +
      `&order=created_at.desc` +
      `&limit=50`;

    const r = await fetch(apiUrl, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!r.ok) {
      console.error('Supabase error:', r.status, await r.text());
      return res.status(200).json([]);
    }

    const posts = await r.json();

    // Normalise: ensure image_url falls back to a picsum placeholder if empty
    const normalised = posts.map(p => ({
      ...p,
      image_url: p.image_url || `https://picsum.photos/seed/${p.slug || p.id}/800/600`,
      views: p.views ?? 0,
      read_time: p.read_time ?? 5,
    }));

    return res.status(200).json(normalised);
  } catch (err) {
    console.error('posts API error:', err);
    return res.status(200).json([]); // always return valid JSON — never break the site
  }
}
