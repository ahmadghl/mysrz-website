import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface ContactPayload {
  full_name?: string;
  email?: string;
  phone?: string | null;
  subject?: string;
  message?: string;
  page_url?: string;
  referrer?: string;
}

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 });
  }

  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { full_name, email, subject, message } = body;
  if (!full_name || !email || !subject || !message) {
    return NextResponse.json(
      { ok: false, error: 'Missing required fields: full_name, email, subject, message' },
      { status: 400 },
    );
  }

  const userAgent = req.headers.get('user-agent') ?? null;
  const forwardedFor = req.headers.get('x-forwarded-for') ?? null;
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

  const insertRes = await fetch(`${url}/rest/v1/contact_submissions`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      full_name,
      email,
      phone: body.phone ?? null,
      subject,
      message,
      page_url: body.page_url ?? null,
      referrer: body.referrer ?? null,
      user_agent: userAgent,
      ip_address: ip,
    }),
  });

  if (!insertRes.ok) {
    const text = await insertRes.text().catch(() => '');
    console.error('[api/contact] insert failed:', insertRes.status, text);
    return NextResponse.json({ ok: false, error: 'Submission failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
