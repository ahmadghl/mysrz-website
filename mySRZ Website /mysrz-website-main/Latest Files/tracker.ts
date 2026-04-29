const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;

// ─── Session & Identity ───────────────────────────────────────────────────────

function getSessionId(): string {
  let id = sessionStorage.getItem('mysrz_sid');
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('mysrz_sid', id); }
  return id;
}
function getVisitorId(): string {
  let id = localStorage.getItem('mysrz_vid');
  if (!id) { id = 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('mysrz_vid', id); }
  return id;
}
function getVisitCount(): number {
  const c = parseInt(localStorage.getItem('mysrz_visits') || '0') + 1;
  localStorage.setItem('mysrz_visits', c.toString());
  return c;
}
function getFirstVisit(): string {
  let f = localStorage.getItem('mysrz_first_visit');
  if (!f) { f = new Date().toISOString(); localStorage.setItem('mysrz_first_visit', f); }
  return f;
}

// ─── Fingerprinting ───────────────────────────────────────────────────────────

function getCanvasFingerprint(): string {
  try {
    const c = document.createElement('canvas'); c.width = 200; c.height = 50;
    const ctx = c.getContext('2d'); if (!ctx) return 'unsupported';
    ctx.textBaseline = 'top'; ctx.font = '14px Arial';
    ctx.fillStyle = '#f60'; ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069'; ctx.fillText('mySRZ Pakistan', 2, 15);
    return c.toDataURL().slice(-80);
  } catch { return 'blocked'; }
}

function getWebGLFingerprint(): Record<string, unknown> {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl') || c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return { supported: false };
    const d = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      supported: true,
      vendor: d ? gl.getParameter(d.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderer: d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    };
  } catch { return { supported: false }; }
}

function getInstalledFonts(): string[] {
  const fonts = ['Arial','Verdana','Georgia','Calibri','Cambria','Segoe UI','Roboto','Open Sans','Ubuntu','Tahoma','Impact','Comic Sans MS'];
  const c = document.createElement('canvas'); const ctx = c.getContext('2d'); if (!ctx) return [];
  const base: Record<string, number> = {};
  ['monospace','sans-serif','serif'].forEach(b => { ctx.font = `16px ${b}`; base[b] = ctx.measureText('mySRZ123').width; });
  return fonts.filter(f => ['monospace','sans-serif','serif'].some(b => { ctx.font = `16px '${f}', ${b}`; return ctx.measureText('mySRZ123').width !== base[b]; }));
}

// ─── Engagement Counters ──────────────────────────────────────────────────────

const pageStartTime = Date.now();
let maxScrollDepth = 0;
let clickCount = 0;
let keyCount = 0;
let mouseMovements = 0;
let touchCount = 0;

function getTimeOnPage() { return Math.round((Date.now() - pageStartTime) / 1000); }
function getScrollDepth() {
  const d = Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100);
  if (d > maxScrollDepth) maxScrollDepth = d;
  return maxScrollDepth;
}

// ─── Device Helpers ───────────────────────────────────────────────────────────

function getPlatform(ua: string) {
  if (/iPhone/.test(ua)) return 'iPhone'; if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android'; if (/Mac/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows'; if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}
function getBrowser(ua: string) {
  if (/Edg\//.test(ua)) return 'Edge'; if (/OPR\/|Opera/.test(ua)) return 'Opera';
  if (/SamsungBrowser/.test(ua)) return 'Samsung'; if (/Chrome/.test(ua)) return 'Chrome';
  if (/Firefox/.test(ua)) return 'Firefox'; if (/Safari/.test(ua)) return 'Safari';
  return 'Other';
}
function getOS(ua: string) {
  if (/iPhone OS ([\d_]+)/.test(ua)) return 'iOS ' + ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g,'.');
  if (/Android ([\d.]+)/.test(ua)) return 'Android ' + ua.match(/Android ([\d.]+)/)?.[1];
  if (/Windows NT ([\d.]+)/.test(ua)) return 'Windows ' + ua.match(/Windows NT ([\d.]+)/)?.[1];
  if (/Mac OS X ([\d_]+)/.test(ua)) return 'macOS ' + ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g,'.');
  return 'Unknown';
}
function detectSocialApp(ua: string) {
  if (/Instagram/.test(ua)) return 'Instagram'; if (/FBAN|FBAV/.test(ua)) return 'Facebook';
  if (/WhatsApp/.test(ua)) return 'WhatsApp'; if (/TikTok/.test(ua)) return 'TikTok';
  if (/Twitter/.test(ua)) return 'Twitter'; if (/Telegram/.test(ua)) return 'Telegram';
  return 'Direct Browser';
}

// ─── Main Collector ───────────────────────────────────────────────────────────

async function collectData(trigger: string, extra?: Record<string, unknown>) {
  const ua = navigator.userAgent;

  // IP/Geo — with timeout
  let ipData: Record<string, unknown> = {};
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    clearTimeout(tid);
    ipData = await res.json();
  } catch { /* silent */ }

  // Battery
  let battery: Record<string, unknown> = {};
  try {
    const b = await (navigator as typeof navigator & { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery?.();
    if (b) battery = { level_percent: Math.round(b.level * 100), charging: b.charging };
  } catch { /* not supported */ }

  // Connection
  type NavConn = { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean; type?: string };
  const conn = (navigator as typeof navigator & { connection?: NavConn }).connection;

  // UTM
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k => { const v = params.get(k); if (v) utm[k] = v; });

  return {
    trigger,
    timestamp: new Date().toISOString(),
    company: 'mySRZ Pakistan',

    identity: {
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      visit_number: getVisitCount(),
      first_visit: getFirstVisit(),
      is_returning: parseInt(localStorage.getItem('mysrz_visits') || '1') > 1,
    },

    network: {
      ip: ipData.ip,
      city: ipData.city,
      region: ipData.region,
      country: ipData.country_name,
      country_code: ipData.country_code,
      postal: ipData.postal,
      latitude: ipData.latitude,
      longitude: ipData.longitude,
      isp: ipData.org,
      timezone: ipData.timezone,
      currency: ipData.currency,
    },

    device: {
      user_agent: ua,
      platform: getPlatform(ua),
      browser: getBrowser(ua),
      os: getOS(ua),
      is_mobile: /Mobi|Android|iPhone|iPad/.test(ua),
      social_app: detectSocialApp(ua),
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      pixel_ratio: window.devicePixelRatio,
      color_depth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type ?? 'unknown',
      cpu_cores: navigator.hardwareConcurrency,
      memory_gb: (navigator as typeof navigator & { deviceMemory?: number }).deviceMemory ?? 'unknown',
      touch_points: navigator.maxTouchPoints,
      battery,
      canvas_fp: getCanvasFingerprint(),
      webgl: getWebGLFingerprint(),
      fonts: getInstalledFonts(),
    },

    connection: {
      effective_type: conn?.effectiveType ?? 'unknown',
      downlink_mbps: conn?.downlink,
      rtt_ms: conn?.rtt,
      save_data: conn?.saveData,
    },

    source: {
      referrer: document.referrer || 'Direct',
      referrer_domain: document.referrer ? (() => { try { return new URL(document.referrer).hostname; } catch { return document.referrer; } })() : 'Direct',
      landing_page: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
      utm,
    },

    locale: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: Array.from(navigator.languages || []).join(', '),
    },

    capabilities: {
      cookies: navigator.cookieEnabled,
      do_not_track: navigator.doNotTrack,
      webrtc: !!window.RTCPeerConnection,
      websocket: !!window.WebSocket,
      service_worker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window ? Notification.permission : 'unsupported',
      geolocation: 'geolocation' in navigator,
    },

    engagement: {
      time_on_page_sec: getTimeOnPage(),
      scroll_depth_pct: getScrollDepth(),
      click_count: clickCount,
      key_count: keyCount,
      mouse_movements: mouseMovements,
      touch_count: touchCount,
    },

    ...(extra ? { event_data: extra } : {}),
  };
}

// ─── Sender — FIXED: tries cors first, falls back to no-cors ─────────────────

async function sendToWebhook(trigger: string, extra?: Record<string, unknown>) {
  try {
    const payload = await collectData(trigger, extra);
    const body = JSON.stringify(payload);

    // Try normal CORS first (works if n8n has CORS headers configured)
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (res.ok || res.status === 0) return;
    } catch { /* CORS blocked, try no-cors */ }

    // Fallback: no-cors (always "succeeds" silently — n8n receives it)
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // no-cors only allows simple headers
      body,
      mode: 'no-cors',
      keepalive: true,
    });

  } catch { /* never break the UI */ }
}

// ─── Global Auto Listeners ────────────────────────────────────────────────────

let trackingInitialized = false;

export function initGlobalTracking() {
  if (trackingInitialized) return;
  trackingInitialized = true;

  // All clicks
  document.addEventListener('click', (e) => {
    clickCount++;
    const t = e.target as HTMLElement;
    const tag = t.tagName.toLowerCase();
    if (['a','button','input','select','textarea'].includes(tag) || t.getAttribute('role') === 'button') {
      sendToWebhook('element_click', {
        tag,
        text: t.innerText?.slice(0, 80),
        id: t.id,
        href: (t as HTMLAnchorElement).href || '',
        page: window.location.pathname,
      });
    }
  }, { capture: true, passive: true });

  // Scroll (debounced)
  let scrollTimer: ReturnType<typeof setTimeout>;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      sendToWebhook('scroll', { depth_pct: getScrollDepth(), scroll_y: Math.round(window.scrollY) });
    }, 800);
  }, { passive: true });

  // Mouse
  document.addEventListener('mousemove', () => { mouseMovements++; }, { passive: true });
  // Touch
  document.addEventListener('touchstart', () => { touchCount++; }, { passive: true });
  // Keys
  document.addEventListener('keydown', () => { keyCount++; }, { passive: true });

  // Visibility
  document.addEventListener('visibilitychange', () => {
    sendToWebhook('visibility_change', { hidden: document.hidden, time_sec: getTimeOnPage() });
  });

  // Page exit — sendBeacon is most reliable for this
  window.addEventListener('beforeunload', () => {
    const data = JSON.stringify({
      trigger: 'page_exit',
      timestamp: new Date().toISOString(),
      company: 'mySRZ Pakistan',
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      time_on_page_sec: getTimeOnPage(),
      scroll_depth_pct: maxScrollDepth,
      click_count: clickCount,
      key_count: keyCount,
    });
    navigator.sendBeacon(WEBHOOK_URL, new Blob([data], { type: 'application/json' }));
  });

  // Copy
  document.addEventListener('copy', () => sendToWebhook('text_copied', { page: window.location.pathname }));
  // Right click
  document.addEventListener('contextmenu', (e) => {
    sendToWebhook('right_click', { tag: (e.target as HTMLElement).tagName.toLowerCase() });
  });
  // Window focus/blur
  window.addEventListener('focus', () => sendToWebhook('window_focus', { time_sec: getTimeOnPage() }));
  window.addEventListener('blur', () => sendToWebhook('window_blur', { time_sec: getTimeOnPage() }));
  // Online/offline
  window.addEventListener('online', () => sendToWebhook('connection_restored'));
  window.addEventListener('offline', () => sendToWebhook('connection_lost'));
  // Orientation
  window.addEventListener('orientationchange', () => {
    sendToWebhook('orientation_change', { type: screen.orientation?.type, angle: screen.orientation?.angle });
  });
  // Print
  window.addEventListener('beforeprint', () => sendToWebhook('print_started'));
  // Heartbeat every 30s
  setInterval(() => sendToWebhook('heartbeat', {
    time_sec: getTimeOnPage(), scroll_pct: maxScrollDepth, clicks: clickCount,
  }), 30000);
}

// ─── Geolocation ──────────────────────────────────────────────────────────────

export function requestAndTrackLocation() {
  if (!('geolocation' in navigator)) return;
  navigator.geolocation.getCurrentPosition(
    (p) => sendToWebhook('geolocation_granted', {
      lat: p.coords.latitude, lng: p.coords.longitude, accuracy_m: p.coords.accuracy,
    }),
    (e) => sendToWebhook('geolocation_denied', { code: e.code, msg: e.message }),
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function requestAndTrackNotification() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(p => sendToWebhook('notification_permission', { permission: p }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function trackPageLoad() {
  initGlobalTracking();
  sendToWebhook('page_load');
  setTimeout(() => requestAndTrackLocation(), 2000);
}

export function trackEvent(eventName: string, details?: Record<string, unknown>) {
  sendToWebhook(eventName, details);
}
