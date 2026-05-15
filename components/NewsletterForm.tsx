'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';

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
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div>
      <h4 className="font-bold text-sm uppercase tracking-widest mb-3 text-white/70">Newsletter</h4>
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="bg-brand-primary/80 border border-white/10 rounded-lg px-3 py-2 text-sm flex-grow focus:outline-none focus:border-brand-accent placeholder:text-brand-primary/70 text-white"
        />
        <button
          type="submit"
          disabled={submitting}
          aria-label="Subscribe"
          className="bg-brand-primary px-3 py-2 rounded-lg hover:bg-brand-primary/90 transition-all text-white disabled:opacity-60"
        >
          <Send size={14} />
        </button>
      </form>
      {sent && <p className="text-brand-accent text-xs mt-2">✓ Subscribed! Thank you.</p>}
    </div>
  );
}
