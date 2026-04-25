import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <Compass size={48} className="text-brand-accent mb-4" />
      <h1 className="text-5xl font-bold text-brand-primary mb-3">Lost in the mountains</h1>
      <p className="text-brand-primary/60 max-w-md mb-8">
        We couldn&apos;t find that page. It may have moved, or you&apos;re following an outdated link.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/" className="bg-brand-accent text-brand-primary px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-brand-accent/90 transition-all">
          Back to home
        </Link>
        <Link href="/blog" className="border border-stone-300 text-brand-primary px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:border-brand-accent transition-all">
          Browse the blog
        </Link>
      </div>
    </div>
  );
}
