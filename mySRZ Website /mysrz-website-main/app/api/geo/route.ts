import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const fwd = req.headers.get('x-forwarded-for') ?? '';
  const real = req.headers.get('x-real-ip') ?? '';
  const ip = fwd.split(',')[0].trim() || real || '';

  try {
    const r = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
      { cache: 'no-store' }
    );
    if (!r.ok) throw new Error(`ip-api ${r.status}`);
    const data = await r.json();
    return NextResponse.json(data, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('[api/geo] lookup failed', { ip, err });
    return NextResponse.json({ error: 'geo lookup failed' }, { status: 500 });
  }
}
