'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// First-party, same-origin ingestion endpoint (app/api/track). No external
// webhook to break — events write straight into Supabase page_analytics.
const TRACK_ENDPOINT = '/api/track';

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

function send(event: string, extra?: Record<string, unknown>) {
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

export function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const depth = Math.round(((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100);
      if (depth > maxScrollRef.current) maxScrollRef.current = depth;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onUnload = () => {
      const data = JSON.stringify({
        event: 'page_exit',
        session_id: getSessionId(),
        path: window.location.pathname,
        time_on_page_sec: Math.round((Date.now() - startTimeRef.current) / 1000),
        max_scroll_pct: maxScrollRef.current,
      });
      navigator.sendBeacon(TRACK_ENDPOINT, new Blob([data], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    send('page_view');
  }, [pathname, searchParams]);

  return null;
}
