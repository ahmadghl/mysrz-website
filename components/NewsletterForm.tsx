'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/track';

/**
 * Aureate-restyled footer newsletter form. Renders against the
 * deep-green footer, so the input is a transparent underline
 * field with cream copy and an antique-gold submit chevron.
 *
 * Submit logic + POST payload to /api/newsletter unchanged.
 * Soft-fail UX preserved (always shows success to avoid
 * confusing the visitor if the upstream webhook is down).
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          page_url: window.location.href,
          referrer: document.referrer || 'Direct',
        }),
      });
    } catch {
      /* silent — UX still shows success to avoid confusing the visitor */
    }
    setSubmitting(false);
    setEmail('');
    setSent(true);
    trackEvent('conversion', { kind: 'newsletter' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-3 border-b border-white/30 pb-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        aria-label="Email address"
        className="flex-grow bg-transparent py-2 font-aureate-body text-aureate-body-md text-white placeholder:text-white/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aureate-primary-fixed-dim"
      />
      <button
        type="submit"
        disabled={submitting}
        aria-label="Subscribe to the newsletter"
        className="p-2 text-aureate-primary-fixed-dim transition-transform hover:translate-x-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aureate-primary-fixed-dim disabled:opacity-50"
      >
        <ArrowRight size={18} />
      </button>
      {sent && (
        <span className="sr-only" role="status">
          Subscribed
        </span>
      )}
    </form>
  );
}
