'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
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

/**
 * Aureate-restyled inquiry form. Sectioned editorial layout with
 * numbered headings + underline-style inputs (matches the Stitch
 * "Plan a Trip" template).
 *
 * Submit logic + POST payload to /api/contact unchanged from the
 * old form, so server-side validation + n8n webhook integration
 * stays compatible. UX behavior preserved: success card with
 * 6-second auto-dismiss, error card on failure, button disabled
 * during submission.
 */
export function ContactForm({ subjects }: { subjects?: SubjectOption[] }) {
  const [form, setForm] = useState<State>(initial);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subjectOptions =
    subjects && subjects.length > 0 ? subjects : FALLBACK_SUBJECTS;

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
        setError(
          data?.error ??
            'Something went wrong. Please try again or email us directly.',
        );
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
    <form onSubmit={submit} className="space-y-16">
      {sent && (
        <div
          role="status"
          className="border border-aureate-primary bg-aureate-surface-container p-6"
        >
          <p className="font-aureate-headline text-lg text-aureate-on-surface">
            Message sent successfully
          </p>
          <p className="mt-2 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
            We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="border border-aureate-error/40 bg-aureate-error-container p-6"
        >
          <p className="font-aureate-body text-aureate-body-md text-aureate-on-error-container">
            {error}
          </p>
        </div>
      )}

      {/* Section 01 — Identity */}
      <section className="space-y-8">
        <div className="flex items-baseline gap-4">
          <span className="font-aureate-headline text-aureate-headline-md text-aureate-outline-variant">
            01
          </span>
          <h3 className="font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
            Your Identity
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-aureate-gutter md:grid-cols-2">
          <FieldUnderline
            label="Full Name *"
            type="text"
            required
            value={form.name}
            onChange={(v) => set('name', v)}
            placeholder="Your full name"
          />
          <FieldUnderline
            label="Email Address *"
            type="email"
            required
            value={form.email}
            onChange={(v) => set('email', v)}
            placeholder="your@email.com"
          />
        </div>
      </section>

      {/* Section 02 — Journey Particulars */}
      <section className="space-y-8">
        <div className="flex items-baseline gap-4">
          <span className="font-aureate-headline text-aureate-headline-md text-aureate-outline-variant">
            02
          </span>
          <h3 className="font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
            Your Trip
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-aureate-gutter md:grid-cols-2">
          <FieldUnderline
            label="Phone Number"
            type="tel"
            value={form.phone}
            onChange={(v) => set('phone', v)}
            placeholder="+92 300 0000000"
          />
          <div className="flex flex-col space-y-2">
            <label className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
              Subject *
            </label>
            <select
              required
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              className="appearance-none border-x-0 border-b border-t-0 border-aureate-outline-variant bg-transparent py-3 font-aureate-body text-aureate-body-md text-aureate-on-surface transition-all duration-300 focus:border-aureate-primary focus:outline-none focus:ring-0"
            >
              <option value="">Select a subject</option>
              {subjectOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section 03 — The Brief */}
      <section className="space-y-8">
        <div className="flex items-baseline gap-4">
          <span className="font-aureate-headline text-aureate-headline-md text-aureate-outline-variant">
            03
          </span>
          <h3 className="font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
            The Brief
          </h3>
        </div>
        <div className="flex flex-col space-y-4">
          <label className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
            What can we help you plan? *
          </label>
          <textarea
            required
            rows={6}
            value={form.message}
            onChange={(e) => set('message', e.target.value)}
            placeholder="Tell us about the regions you want to see, the dates you're thinking of, group size, anything that helps shape the response."
            className="resize-none border border-aureate-outline-variant bg-aureate-surface-container-low p-6 font-aureate-body text-aureate-body-md text-aureate-on-surface transition-all duration-500 hover:border-aureate-primary/50 focus:border-aureate-primary focus:outline-none focus:ring-1 focus:ring-aureate-primary"
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex flex-col items-start justify-between gap-8 border-t border-aureate-outline-variant pt-12 md:flex-row md:items-center">
        <p className="max-w-sm font-aureate-body text-aureate-body-md italic text-aureate-on-surface-variant">
          A real human reads every inquiry. We respond within 24 hours.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex items-center justify-center gap-4 bg-aureate-primary px-12 py-5 font-aureate-label text-aureate-label-md uppercase tracking-[0.2em] text-aureate-on-primary shadow-xl transition-all duration-500 hover:bg-aureate-primary-container hover:shadow-2xl active:scale-95 disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send Inquiry'}
          <ArrowRight
            size={16}
            className="transition-transform duration-500 group-hover:translate-x-2"
          />
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  type: 'text' | 'email' | 'tel';
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

function FieldUnderline({
  label,
  type,
  required,
  value,
  onChange,
  placeholder,
}: FieldProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-x-0 border-b border-t-0 border-aureate-outline-variant bg-transparent py-3 font-aureate-body text-aureate-body-md text-aureate-on-surface transition-all duration-300 placeholder:text-aureate-on-surface-variant/40 focus:border-aureate-primary focus:outline-none focus:ring-0"
      />
    </div>
  );
}
