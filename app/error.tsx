'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, ArrowRight } from 'lucide-react';

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
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <AlertTriangle
          size={40}
          className="mx-auto mb-4 text-brand-accent"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold text-brand-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-brand-primary/60 mb-6">
          We hit an unexpected error rendering this page. Please try again,
          or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="bg-brand-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-primary/90 transition-all"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-accent/90 transition-all"
          >
            <Home size={14} /> Home <ArrowRight size={14} />
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-brand-primary/40">
            Error ref: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
