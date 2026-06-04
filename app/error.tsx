'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { AureateButton } from '@/components/aureate/AureateButton';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-aureate-mobile py-24 md:px-aureate-desktop">
      <div className="max-w-md text-center">
        <AlertTriangle
          size={40}
          className="mx-auto mb-6 text-aureate-primary"
          aria-hidden="true"
        />
        <h1 className="mb-4 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
          Something went wrong
        </h1>
        <p className="mb-10 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
          We hit an unexpected error rendering this page. Please try again, or
          head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <AureateButton onClick={() => reset()} variant="primary">
            Try Again
          </AureateButton>
          <AureateButton href="/" variant="outline-on-light">
            <Home size={14} className="mr-2" aria-hidden="true" /> Home
          </AureateButton>
        </div>
        {error.digest && (
          <p className="mt-8 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant/70">
            Error ref: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
