import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface SubscribePayload {
  email?: string;
  page_url?: string;
  referrer?: string;
}

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }

  let body: SubscribePayload;
  try {
    body = (await req.json()) as SubscribePayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Valid email required' }, { status: 400 });
  }

  const userAgent = req.headers.get('user-agent') ?? null;

  // Try insert. If email already exists, treat as success (idempotent subscribe).
  const insertRes = await fetch(`${url}/rest/v1/newsletter_subscribers`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal,resolution=ignore-duplicates',
    },
    body: JSON.stringify({
      email,
      source: 'website',
      page_url: body.page_url ?? null,
      referrer: body.referrer ?? null,
      user_agent: userAgent,
    }),
  });

  if (!insertRes.ok && insertRes.status !== 409) {
    const text = await insertRes.text().catch(() => '');
    console.error('[api/newsletter] insert failed:', insertRes.status, text);
    return NextResponse.json({ ok: false, error: 'Subscription failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
