import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getSiteSettings } from '@/lib/site-settings';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';

export const metadata: Metadata = {
  title: 'Plan a Trip — mySRZ Pakistan Travel',
  description:
    'Get in touch with mySRZ Travel & Tourism to plan your Pakistan trip. Call +92-301-2432222 or send us a message. We reply within 24 hours.',
  alternates: { canonical: '/contact' },
  keywords: [
    'contact mySRZ',
    'book Pakistan tour',
    'Pakistan tour inquiry',
    'Ahmad Fraz contact',
  ],
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Plan a Trip' },
        ]}
        hideVisual
      />

      {/* ───── HEADER ───── */}
      <RevealOnScroll
        as="section"
        className="mx-auto max-w-aureate-container px-aureate-mobile pt-16 md:px-aureate-desktop md:pt-24"
      >
        <div className="mb-16 max-w-3xl">
          <span className="mb-4 block font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">
            {settings.contact_kicker}
          </span>
          <h1 className="mb-6 font-aureate-display text-aureate-display-lg-mobile leading-tight text-aureate-on-surface md:text-aureate-display-lg">
            {settings.contact_title}
          </h1>
          <p className="font-aureate-body text-aureate-body-lg italic text-aureate-on-surface-variant">
            {settings.contact_subtitle}
          </p>
        </div>
      </RevealOnScroll>

      {/* ───── FORM + SIDEBAR ───── */}
      <section className="mx-auto grid max-w-aureate-container grid-cols-1 gap-16 px-aureate-mobile pb-24 md:px-aureate-desktop lg:grid-cols-12">
        {/* Sidebar — concierge access pattern */}
        <RevealOnScroll as="aside" className="space-y-12 lg:col-span-4">
          <div className="space-y-6">
            <h2 className="border-b border-aureate-outline-variant pb-4 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
              Direct Contact
            </h2>
            <div className="space-y-6">
              <div>
                <p className="mb-1 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                  Phone / WhatsApp
                </p>
                <a
                  href={settings.phone_link}
                  className="inline-flex items-center gap-2 font-aureate-body text-aureate-body-lg text-aureate-on-surface transition-colors hover:text-aureate-primary"
                >
                  <Phone size={14} aria-hidden="true" />
                  {settings.phone_display}
                </a>
              </div>
              <div>
                <p className="mb-1 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                  Email
                </p>
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex items-center gap-2 break-all font-aureate-body text-aureate-body-lg text-aureate-on-surface transition-colors hover:text-aureate-primary"
                >
                  <Mail size={14} aria-hidden="true" />
                  {settings.email}
                </a>
              </div>
              <div>
                <p className="mb-1 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                  Based In
                </p>
                <p className="inline-flex items-center gap-2 font-aureate-body text-aureate-body-lg text-aureate-on-surface">
                  <MapPin size={14} aria-hidden="true" />
                  {settings.address_label}
                </p>
              </div>
              <div>
                <p className="mb-1 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                  Response Time
                </p>
                <p className="inline-flex items-center gap-2 font-aureate-body text-aureate-body-lg text-aureate-on-surface">
                  <Clock size={14} aria-hidden="true" />
                  {settings.contact_response_time}
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp quick-channel card */}
          <div className="border border-aureate-outline-variant bg-aureate-surface-container-low p-8">
            <div className="mb-3 flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
              <MessageCircle size={14} aria-hidden="true" /> WhatsApp Us
            </div>
            <p className="mb-6 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
              For a quick question, message us directly on WhatsApp.
            </p>
            <a
              href={settings.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 border border-aureate-primary px-6 py-3 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-aureate-primary hover:text-aureate-on-primary hover:shadow-md"
            >
              <MessageCircle size={14} aria-hidden="true" /> Open WhatsApp
            </a>
          </div>

          {/* What-we-help-with chips, only if admin populated */}
          {settings.contact_help_list.length > 0 && (
            <div>
              <h3 className="mb-4 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                We can help with
              </h3>
              <ul className="space-y-2">
                {settings.contact_help_list.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 flex-shrink-0 bg-aureate-primary"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </RevealOnScroll>

        {/* Form */}
        <RevealOnScroll className="lg:col-span-8">
          <ContactForm subjects={settings.contact_subjects} />
        </RevealOnScroll>
      </section>
    </>
  );
}
