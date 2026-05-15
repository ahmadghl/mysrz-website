'use client';

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import type { SubjectOption } from '@/lib/site-settings';

interface State {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initial: State = { name: '', email: '', phone: '', subject: '', message: '' };

const FALLBACK_SUBJECTS: SubjectOption[] = [
  { value: 'trip-planning', label: 'Trip Planning' },
  { value: 'destination-query', label: 'Destination Query' },
  { value: 'collaboration', label: 'Collaboration / Partnership' },
  { value: 'guest-post', label: 'Guest Post Submission' },
  { value: 'general', label: 'General Inquiry' },
];

export function ContactForm({ subjects }: { subjects?: SubjectOption[] }) {
  const [form, setForm] = useState<State>(initial);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subjectOptions = subjects && subjects.length > 0 ? subjects : FALLBACK_SUBJECTS;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.name,
          email: form.email,
          phone: form.phone || null,
          subject: form.subject,
          message: form.message,
          page_url: window.location.href,
          referrer: document.referrer || 'Direct',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Something went wrong. Please try again or email us directly.');
        setSubmitting(false);
        return;
      }
    } catch {
      setError("Couldn't reach the server. Please check your connection.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
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
          <div className="w-8 h-8 bg-brand-accent text-brand-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-brand-primary text-sm font-bold">✓</span>
          </div>
          <div>
            <div className="font-semibold text-brand-primary">Message sent successfully!</div>
            <div className="text-sm text-brand-primary">We&apos;ll get back to you within 24 hours.</div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          {error}
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
              {subjectOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
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
          disabled={submitting}
          className="w-full bg-brand-accent text-brand-primary py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-brand-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Send size={16} /> {submitting ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
