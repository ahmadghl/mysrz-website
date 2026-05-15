import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// POST /api/revalidate
//
// Called from a Supabase database webhook on INSERT/UPDATE/DELETE of
// `blog_posts`. Pass the secret via `Authorization: Bearer <secret>` or
// `x-webhook-secret: <secret>`. Query-string secrets are NOT accepted
// because they leak into upstream proxy and request logs.
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.error('[api/revalidate] REVALIDATE_SECRET is not set');
    return NextResponse.json({ ok: false, error: 'not configured' }, { status: 500 });
  }

  const provided =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    req.headers.get('x-webhook-secret') ||
    '';

  if (!provided || provided !== secret) {
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
