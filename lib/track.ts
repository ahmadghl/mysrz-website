// Client-side analytics helper. Centralises the session id + the payload shape
// so the Tracker component AND feature components (forms, buttons) can record
// events through the same first-party endpoint (app/api/track), which writes to
// Supabase page_analytics. Country/city are added server-side from Vercel's geo
// headers, so nothing location-related is collected in the browser.

const TRACK_ENDPOINT = '/api/track';

/**
 * Self-exclusion. Visiting any page with `?notrack=1` sets a persistent opt-out
 * on that device (use `?notrack=0` to turn tracking back on). This keeps the
 * team's own browsing out of the first-party analytics, so the SEO / AEO / GEO
 * numbers reflect real visitors only.
 */
function trackingDisabled(): boolean {
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('notrack') === '1') localStorage.setItem('mysrz_notrack', '1');
    else if (sp.get('notrack') === '0') localStorage.removeItem('mysrz_notrack');
    return localStorage.getItem('mysrz_notrack') === '1';
  } catch {
    return false;
  }
}

export function getSessionId(): string {
  let id = sessionStorage.getItem('mysrz_sid');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('mysrz_sid', id);
  }
  return id;
}

export function isReturning(): boolean {
  const v = localStorage.getItem('mysrz_returning');
  if (!v) {
    localStorage.setItem('mysrz_returning', '1');
    return false;
  }
  return true;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android|iPhone|iPad/.test(ua);
  const isTablet = /iPad|tablet/i.test(ua);
  let browser = 'Other';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome/.test(ua)) browser = 'Chrome';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Safari/.test(ua)) browser = 'Safari';
  let os = 'Other';
  if (/iPhone OS/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  return {
    device_type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    browser,
    os,
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/** Fire an event with full page + device + utm context. Best-effort. */
export function trackEvent(event: string, extra?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (trackingDisabled()) return;
  const params = new URLSearchParams(window.location.search);
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    site: 'mySRZ Travel & Tourism',
    session_id: getSessionId(),
    returning_visitor: isReturning(),
    page: {
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || 'Direct',
    },
    device: getDeviceInfo(),
    utm: {
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_term: params.get('utm_term'),
      utm_content: params.get('utm_content'),
    },
    ...(extra ? { data: extra } : {}),
  };
  try {
    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* silent */
  }
}

/** Lightweight beacon for unload-time events (page_exit). */
export function trackBeacon(event: string, extra: Record<string, unknown>) {
  if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;
  if (trackingDisabled()) return;
  const data = JSON.stringify({ event, session_id: getSessionId(), ...extra });
  navigator.sendBeacon(TRACK_ENDPOINT, new Blob([data], { type: 'application/json' }));
}
