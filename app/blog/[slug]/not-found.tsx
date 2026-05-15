import Link from 'next/link';
import { ArrowRight, FileQuestion } from 'lucide-react';

export default function PostNotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-md text-center">
        <FileQuestion size={40} className="mx-auto mb-4 text-brand-accent" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-brand-primary mb-2">Article not found</h1>
        <p className="text-brand-primary/60 mb-6">
          This article either moved or was never here. Browse all our travel
          writing instead.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 bg-brand-accent text-brand-primary px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-accent/90 transition-all"
        >
          All Articles <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
