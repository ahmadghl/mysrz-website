'use client';

/**
 * Floating WhatsApp call-to-action, fixed bottom-right on every page.
 *
 * WhatsApp is how this audience actually reaches out — our first real booking
 * enquiry came through WhatsApp, not the contact form — so this is the primary
 * conversion path for turning blog/search traffic into trip enquiries.
 *
 * The #25D366 green is WhatsApp's official brand colour, an intentional
 * exception to the "no hardcoded colours" theme rule (the same way a logo mark
 * is), so the button is instantly recognisable and trusted.
 */
import { useEffect, useState } from 'react';

const PREFILL =
  "Hi mySRZ 👋 I'd like to plan a trip to northern Pakistan. Can you help me with an itinerary?";

export function FloatingWhatsApp({ whatsappUrl }: { whatsappUrl: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Fade in shortly after load so it never competes with the LCP.
    const t = setTimeout(() => setShow(true), 700);
    return () => clearTimeout(t);
  }, []);

  const href = `${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${encodeURIComponent(PREFILL)}`;

  function handleClick() {
    // Conversion tracking: fire a GA4 event if analytics is present.
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'floating_button',
      });
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Chat with mySRZ on WhatsApp to plan your trip"
      className={`fixed bottom-5 right-5 z-50 flex items-center rounded-full shadow-lg transition-all duration-300 hover:shadow-xl ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
      style={{ backgroundColor: '#25D366', color: '#ffffff' }}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </span>
      <span className="hidden pr-5 text-sm font-semibold sm:inline-block">Plan your trip</span>
    </a>
  );
}
