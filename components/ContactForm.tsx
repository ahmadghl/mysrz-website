'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { SITE } from '@/lib/utils';

interface State {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initial: State = { name: '', email: '', phone: '', subject: '', message: '' };

export function ContactForm() {
  const [form, setForm] = useState<State>(initial);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetch(SITE.contactWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_name: 'Contact Form',
          form_source: SITE.name,
          website: SITE.url,
          submitted_at: new Date().toISOString(),
          contact: {
            full_name: form.name,
            email: form.email,
            phone: form.phone || null,
            subject: form.subject,
            message: form.message,
          },
          meta: {
            page_url: window.location.href,
            referrer: document.referrer || 'Direct',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
          },
        }),
      });
    } catch {
      /* silent */
    }
    setSent(true);
    setForm(initial);
    setTimeout(() => setSent(false), 6000);
  };

  const set = <K extends keyof State>(key: K, value: State[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="bg-brand-paper rounded-2xl shadow-sm border border-black/5 p-8">
      <h2 className="text-2xl font-bold text-brand-primary mb-6">Send a Message</h2>

      {sent && (
        <div className="bg-brand-paper border border-brand-accent/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">✓</span>
          </div>
          <div>
            <div className="font-semibold text-emerald-800">Message sent successfully!</div>
            <div className="text-sm text-emerald-700">We&apos;ll get back to you within 24 hours.</div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Your full name"
              className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+92 300 0000000"
              className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Subject *</label>
            <select
              required
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent bg-white focus:ring-1 focus:ring-brand-accent transition-all"
            >
              <option value="">Select a subject</option>
              <option value="trip-planning">Trip Planning</option>
              <option value="destination-query">Destination Query</option>
              <option value="collaboration">Collaboration / Partnership</option>
              <option value="guest-post">Guest Post Submission</option>
              <option value="general">General Inquiry</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Message *</label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="Tell us about your trip plans, questions, or anything else..."
            className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent resize-none transition-all"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
        >
          <Send size={16} /> Send Message
        </button>
      </form>
    </div>
  );
}
