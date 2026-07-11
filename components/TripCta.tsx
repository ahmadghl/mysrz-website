import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/utils';

// Conversion CTA shown at the end of every blog post: turns research-intent
// readers into trip enquiries. WhatsApp is the primary action because it is
// how this audience actually reaches out and converts best; the contact form
// and email are kept as fallbacks. Free-itinerary framing = low commitment.
const WA_MESSAGE = encodeURIComponent(
  "Hi mySRZ 👋 I just read your travel guide and I'd like a free, custom itinerary for my Pakistan trip. Can you help?"
);
const WA_HREF = `${SITE.whatsapp}?text=${WA_MESSAGE}`;

export function TripCta() {
  return (
    <aside className="mt-12 rounded-2xl border border-aureate-outline-variant bg-aureate-surface-container-low p-8 text-center">
      <span className="mb-2 block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
        Plan with mySRZ
      </span>
      <h2 className="font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
        Want help planning this trip?
      </h2>
      <p className="mx-auto mt-3 max-w-xl font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
        Tell us your dates and what you would like to see, and we will send you a free,
        no-obligation custom itinerary. The quickest way to reach us is WhatsApp.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        {/* Primary: WhatsApp. #25D366 is WhatsApp's brand colour (intentional
            exception to the theme, same as the floating button) for recognition. */}
        <a
          href={WA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full px-6 py-3 font-aureate-label text-aureate-label-md uppercase tracking-widest shadow-sm transition-all hover:opacity-90"
          style={{ backgroundColor: '#25D366', color: '#ffffff' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat on WhatsApp
        </a>
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 rounded-full border border-aureate-primary px-6 py-3 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary transition-all hover:bg-aureate-primary hover:text-aureate-on-primary"
        >
          Get a free itinerary
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
      <a
        href="mailto:mysrzpakistan@gmail.com"
        className="mt-4 inline-block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant hover:text-aureate-primary hover:underline"
      >
        or email us
      </a>
    </aside>
  );
}
