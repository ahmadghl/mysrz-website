import Link from 'next/link';
import { Compass } from 'lucide-react';
import { AureateButton } from '@/components/aureate/AureateButton';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-aureate-mobile py-24 text-center md:px-aureate-desktop">
      <Compass
        size={48}
        className="mb-6 text-aureate-primary"
        aria-hidden="true"
      />
      <span className="mb-4 block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
        404
      </span>
      <h1 className="mb-4 font-aureate-display text-aureate-headline-lg-mobile italic text-aureate-on-surface md:text-aureate-display-lg">
        Lost in the mountains
      </h1>
      <p className="mb-10 max-w-md font-aureate-body text-aureate-body-lg text-aureate-on-surface-variant">
        We couldn&apos;t find that page. It may have moved, or you&apos;re
        following an outdated link.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <AureateButton href="/" variant="primary">
          Back to Home
        </AureateButton>
        <AureateButton href="/blog" variant="outline-on-light">
          Browse the Journal
        </AureateButton>
      </div>
    </div>
  );
}
