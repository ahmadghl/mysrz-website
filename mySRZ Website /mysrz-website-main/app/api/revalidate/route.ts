import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

/**
 * POST /api/revalidate?secret=YOUR_SECRET
 *
 * Call this from a Supabase database webhook (Database → Webhooks) on
 * INSERT/UPDATE/DELETE of `blog_posts`. It instantly invalidates the
 * cached posts list and the affected post's page so changes appear live
 * without waiting for the 60s revalidation window.
 *
 * Set REVALIDATE_SECRET in Vercel env vars and pass it as ?secret=...
 * (or in the Authorization header) when calling this endpoint.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error('[api/revalidate] REVALIDATE_SECRET is not set');
    return NextResponse.json({ ok: false, error: 'not configured' }, { status: 500 });
  }

  const url = new URL(req.url);
  const provided =
    url.searchParams.get('secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    req.headers.get('x-webhook-secret') ||
    '';

  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    const body = (await req.json().catch(() => null)) as
      | { record?: { slug?: string }; old_record?: { slug?: string }; slug?: string }
      | null;
    slug =
      body?.record?.slug || body?.old_record?.slug || body?.slug || undefined;
  } catch (err) {
    console.error('[api/revalidate] body parse failed', err);
  }

  revalidateTag('posts');
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  if (slug) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({
    ok: true,
    revalidated: { tag: 'posts', slug: slug ?? null, at: new Date().toISOString() },
  });
}
