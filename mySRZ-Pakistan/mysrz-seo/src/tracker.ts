// ─── mySRZ Simple Analytics Tracker ─────────────────────────────────────────
// Lightweight, privacy-friendly tracking — page views, events, and basic device info.
const WEBHOOK_URL = import.meta.env.VITE_TRACKER_WEBHOOK_URL as string | undefined;

function getSessionId(): string {
  let id = sessionStorage.getItem('mysrz_sid');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('mysrz_sid', id);
  }
  return id;
}

function isReturning(): boolean {
  const v = localStorage.getItem('mysrz_returning');
  if (!v) { localStorage.setItem('mysrz_returning', '1'); return false; }
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
  else if (/OPR\//.test(ua)) browser = 'Opera';
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

function getUTM() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source:   p.get('utm_source')   || null,
    utm_medium:   p.get('utm_medium')   || null,
    utm_campaign: p.get('utm_campaign') || null,
    utm_term:     p.get('utm_term')     || null,
    utm_content:  p.get('utm_content')  || null,
  };
}

function send(event: string, extra?: Record<string, unknown>) {
  if (!WEBHOOK_URL) return;
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
    utm: getUTM(),
    ...(extra ? { data: extra } : {}),
  };
  try {
    fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch { /* silent */ }
}

let _startTime = Date.now();
let _maxScroll = 0;

window.addEventListener('scroll', () => {
  const depth = Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100);
  if (depth > _maxScroll) _maxScroll = depth;
}, { passive: true });

window.addEventListener('beforeunload', () => {
  if (!WEBHOOK_URL) return;
  const data = JSON.stringify({
    event: 'page_exit', session_id: getSessionId(), path: window.location.pathname,
    time_on_page_sec: Math.round((Date.now() - _startTime) / 1000), max_scroll_pct: _maxScroll,
  });
  navigator.sendBeacon(WEBHOOK_URL, new Blob([data], { type: 'application/json' }));
});

export function trackPageLoad() { _startTime = Date.now(); _maxScroll = 0; send('page_view'); }
export function trackEvent(eventName: string, details?: Record<string, unknown>) { send(eventName, details); }
