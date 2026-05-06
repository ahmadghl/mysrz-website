import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

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

  const path = url.searchParams.get('path') ?? '/';

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

  // Always revalidate both tags
  revalidateTag('posts');
  revalidateTag('destinations');

  // Revalidate common paths
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/destinations');
  revalidatePath('/sitemap.xml');

  // Revalidate specific path if provided
  if (path && path !== '/') revalidatePath(path);
  if (slug) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({
    ok: true,
    revalidated: {
      tags: ['posts', 'destinations'],
      path,
      slug: slug ?? null,
      at: new Date().toISOString()
    },
  });
}
