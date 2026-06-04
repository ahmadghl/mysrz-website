import { MapPin } from 'lucide-react';
import { AureateButton } from '@/components/aureate/AureateButton';

export default function DestinationNotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-aureate-mobile py-24 md:px-aureate-desktop">
      <div className="max-w-md text-center">
        <MapPin
          size={40}
          className="mx-auto mb-6 text-aureate-primary"
          aria-hidden="true"
        />
        <h1 className="mb-4 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
          Destination not found
        </h1>
        <p className="mb-10 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
          This destination guide isn&apos;t live yet. Explore the rest of
          Pakistan in the meantime.
        </p>
        <AureateButton href="/destinations" variant="primary">
          All Destinations
        </AureateButton>
      </div>
    </main>
  );
}
