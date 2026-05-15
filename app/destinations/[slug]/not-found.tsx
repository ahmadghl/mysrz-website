import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

export default function DestinationNotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <MapPin size={40} className="mx-auto mb-4 text-brand-accent" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-brand-primary mb-2">Destination not found</h1>
        <p className="text-brand-primary/60 mb-6">
          This destination guide isn&apos;t live yet. Explore the rest of
          Pakistan in the meantime.
        </p>
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-accent/90 transition-all"
        >
          All Destinations <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
