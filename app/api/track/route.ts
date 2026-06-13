import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// First-party analytics ingestion. The website Tracker posts `page_view` and
// `page_exit` events here (same-origin) and we write them straight into the
// page_analytics table via the anon key + an INSERT-only RLS policy — the same
// pattern as /api/contact and /api/newsletter. No external webhook, so it can't
// silently stop working the way the old n8n flow did.

interface TrackPayload {
  event?: string;
  session_id?: string;
  returning_visitor?: boolean;
  page?: { url?: string; path?: string; title?: string; referrer?: string };
  device?: {
    device_type?: string; browser?: string; os?: string;
    screen?: string; language?: string; timezone?: string;
  };
  utm?: { utm_source?: string | null; utm_medium?: string | null; utm_campaign?: string | null };
  // page_exit (sendBeacon) shape:
  path?: string;
  time_on_page_sec?: number;
  max_scroll_pct?: number;
  data?: unknown;
}

const ALLOWED_EVENTS = new Set(['page_view', 'page_exit', 'click', 'conversion']);

// Bots, crawlers, link-preview unfurlers, headless browsers, uptime monitors
// and scripted clients are not real audience and would skew every SEO / AEO /
// GEO read. Drop them at ingestion so they never enter page_analytics. Named
// agents only (no bare "bot" match), so device brands like "Cubot" are safe.
const BOT_UA = /facebookexternalhit|facebot|headless|googlebot|google-extended|bingbot|applebot|yandex|baiduspider|duckduckbot|petalbot|bytespider|ahrefsbot|semrushbot|mj12bot|dotbot|dataforseo|gptbot|ccbot|claudebot|claude-web|anthropic-ai|perplexitybot|oai-searchbot|amazonbot|lighthouse|gtmetrix|pingdom|uptimerobot|statuscake|site24x7|phantomjs|puppeteer|playwright|selenium|cypress|python-requests|python-urllib|scrapy|wget|go-http-client|node-fetch|okhttp|libwww|java\/|whatsapp|telegrambot|slackbot|discordbot|twitterbot|linkedinbot|pinterest|redditbot|embedly|quora|w3c_validator|vkshare|skypeuripreview|crawler|spider|scraper|crawling|curl\//i;

// Always answer 204 so a failed insert never surfaces an error to the visitor
// or the sendBeacon call. Tracking is best-effort and must never break a page.
const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return noContent();

  let b: TrackPayload;
  try {
    b = (await req.json()) as TrackPayload;
  } catch {
    return noContent();
  }

  const event = typeof b.event === 'string' ? b.event : '';
  if (!ALLOWED_EVENTS.has(event) || !b.session_id) return noContent();

  // Drop bot / crawler / preview / monitor traffic. A missing UA on a scripted
  // POST is almost never a real browser, so treat that as a bot too.
  const ua = req.headers.get('user-agent') || '';
  if (!ua || BOT_UA.test(ua)) return noContent();

  // Geography from Vercel's edge geo headers (present in production on Vercel).
  // City/region are URL-encoded; country is an ISO code. No IP is stored.
  const h = req.headers;
  const dec = (v: string | null) => {
    if (!v) return null;
    try { return decodeURIComponent(v); } catch { return v; }
  };

  const row = {
    event,
    session_id: b.session_id,
    country: h.get('x-vercel-ip-country') || null,
    region: dec(h.get('x-vercel-ip-country-region')),
    city: dec(h.get('x-vercel-ip-city')),
    returning_visitor: b.returning_visitor ?? null,
    page_url: b.page?.url ?? null,
    page_path: b.page?.path ?? b.path ?? null,
    page_title: b.page?.title ?? null,
    referrer: b.page?.referrer ?? null,
    device_type: b.device?.device_type ?? null,
    browser: b.device?.browser ?? null,
    os: b.device?.os ?? null,
    screen: b.device?.screen ?? null,
    language: b.device?.language ?? null,
    timezone: b.device?.timezone ?? null,
    utm_source: b.utm?.utm_source ?? null,
    utm_medium: b.utm?.utm_medium ?? null,
    utm_campaign: b.utm?.utm_campaign ?? null,
    time_on_page_sec: typeof b.time_on_page_sec === 'number' ? b.time_on_page_sec : null,
    max_scroll_pct: typeof b.max_scroll_pct === 'number' ? b.max_scroll_pct : null,
    event_data: b.data ?? null,
  };

  try {
    const res = await fetch(`${url}/rest/v1/page_analytics`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[api/track] insert failed:', res.status, text);
    }
  } catch (err) {
    console.error('[api/track] error:', err);
  }

  return noContent();
}
