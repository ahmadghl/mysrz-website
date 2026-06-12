'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, trackBeacon } from '@/lib/track';

// Classify a clicked link into an outbound/contact interaction worth recording.
// Returns null for ordinary internal navigation (already covered by page_view).
function clickKind(href: string): string | null {
  if (!href) return null;
  if (href.startsWith('tel:')) return 'phone';
  if (href.startsWith('mailto:')) return 'email';
  if (href.includes('wa.me') || href.toLowerCase().includes('whatsapp')) return 'whatsapp';
  if (/^https?:\/\//.test(href)) {
    try {
      const host = new URL(href).hostname.replace(/^www\./, '');
      if (!host.endsWith('mysrztourism.com') && host !== window.location.hostname) return 'outbound';
    } catch {
      return null;
    }
  }
  return null;
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

    // Outbound / WhatsApp / phone / email click tracking via event delegation.
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      const kind = clickKind(href);
      if (!kind) return;
      trackEvent('click', {
        kind,
        href: href.slice(0, 300),
        text: (a.textContent ?? '').trim().slice(0, 80),
      });
    };
    document.addEventListener('click', onClick, { capture: true });

    const onUnload = () => {
      trackBeacon('page_exit', {
        path: window.location.pathname,
        time_on_page_sec: Math.round((Date.now() - startTimeRef.current) / 1000),
        max_scroll_pct: maxScrollRef.current,
      });
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick, { capture: true } as EventListenerOptions);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    startTimeRef.current = Date.now();
    maxScrollRef.current = 0;
    trackEvent('page_view');
  }, [pathname, searchParams]);

  return null;
}
