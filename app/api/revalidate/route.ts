import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// POST /api/revalidate
//
// Called from:
//   1. The admin panel (admin.mysrztourism.com) after content mutations.
//      Pattern: `POST /api/revalidate?path=/destinations` with auth in a
//      header (preferred) or `&secret=...` (deprecated — still accepted
//      so the live admin doesn't break during the migration).
//   2. A Supabase Database Webhook on insert/update/delete of
//      `blog_posts`, `destinations`, or `site_settings`. Pattern: JSON body
//      `{ record: { slug }, table: 'blog_posts' }` with the secret in
//      the `Authorization: Bearer` or `x-webhook-secret` header.
//
// Header secrets always win over query secrets so we can drop the
// query path in a follow-up without breaking anyone who already
// updated.
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error('[api/revalidate] REVALIDATE_SECRET is not set');
    return NextResponse.json(
      { ok: false, error: 'not configured' },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const headerSecret =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    req.headers.get('x-webhook-secret') ||
    '';
  const querySecret = url.searchParams.get('secret') ?? '';
  const provided = headerSecret || querySecret;

  if (!provided || provided !== secret) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized' },
      { status: 401 },
    );
  }

  if (!headerSecret && querySecret) {
    console.warn(
      '[api/revalidate] DEPRECATED: secret passed via query string. ' +
        'Move callers to `Authorization: Bearer <secret>` header.',
    );
  }

  // Pattern 1: admin path-driven invalidation
  const path = url.searchParams.get('path');
  if (path) {
    revalidatePath(path);
    if (path.startsWith('/blog')) revalidateTag('posts');
    if (path.startsWith('/destinations')) revalidateTag('destinations');
    if (path === '/about' || path === '/contact' || path === '/') {
      revalidateTag('site_settings');
    }
    if (path === '/') {
      revalidateTag('posts');
      revalidateTag('destinations');
      revalidateTag('live_stats');
    }
    return NextResponse.json({
      ok: true,
      revalidated: { path, at: new Date().toISOString() },
    });
  }

  // Pattern 2: Supabase webhook body
  let slug: string | undefined;
  let table: string | undefined;
  try {
    const body = (await req.json().catch(() => null)) as
      | {
          record?: { slug?: string };
          old_record?: { slug?: string };
          slug?: string;
          table?: string;
        }
      | null;
    slug = body?.record?.slug || body?.old_record?.slug || body?.slug || undefined;
    table = body?.table;
  } catch (err) {
    console.error('[api/revalidate] body parse failed', err);
  }

  // Default: invalidate the broad indexes
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
  // Live stats are derived from destinations + posts counts, so bust them
  // whenever any content table changes.
  revalidateTag('live_stats');

  if (!table || table === 'blog_posts') {
    revalidateTag('posts');
    revalidatePath('/blog');
    if (slug) revalidatePath(`/blog/${slug}`);
  }
  if (!table || table === 'destinations') {
    revalidateTag('destinations');
    revalidatePath('/destinations');
    if (slug) revalidatePath(`/destinations/${slug}`);
  }
  if (!table || table === 'site_settings') {
    revalidateTag('site_settings');
    revalidatePath('/about');
    revalidatePath('/contact');
  }

  return NextResponse.json({
    ok: true,
    revalidated: {
      table: table ?? null,
      slug: slug ?? null,
      at: new Date().toISOString(),
    },
  });
}
