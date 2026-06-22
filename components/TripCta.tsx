import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Conversion CTA shown at the end of every blog post: turns research-intent
// readers into trip enquiries. Free-itinerary framing (low commitment, high
// conversion); routes to the contact form with email as a fallback.
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
        no-obligation custom itinerary for your Pakistan trip.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/contact"
          className="group inline-flex items-center gap-2 rounded-full bg-aureate-primary px-6 py-3 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-primary transition-all hover:opacity-90"
        >
          Get a free itinerary
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <a
          href="mailto:mysrzpakistan@gmail.com"
          className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary hover:underline"
        >
          or email us
        </a>
      </div>
    </aside>
  );
}
