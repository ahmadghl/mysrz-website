'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Search, X, Mountain, Camera, Utensils, Leaf } from 'lucide-react';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

const CATEGORIES: Category[] = ['All', 'Adventure', 'Culture', 'Food', 'Nature'];
const ICONS: Record<Exclude<Category, 'All'>, typeof Mountain> = {
  Adventure: Mountain,
  Culture: Camera,
  Food: Utensils,
  Nature: Leaf,
};

interface Props {
  activeCategory: Category;
  initialQuery: string;
}

export function BlogFilters({ activeCategory, initialQuery }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery);

  const buildHref = (cat: Category) => {
    const sp = new URLSearchParams(params.toString());
    if (cat === 'All') sp.delete('category');
    else sp.set('category', cat);
    const s = sp.toString();
    return s ? `/blog?${s}` : '/blog';
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const sp = new URLSearchParams(params.toString());
    if (q.trim()) sp.set('q', q.trim());
    else sp.delete('q');
    const s = sp.toString();
    router.push(s ? `/blog?${s}` : '/blog');
  };

  const clear = () => {
    setQ('');
    const sp = new URLSearchParams(params.toString());
    sp.delete('q');
    const s = sp.toString();
    router.push(s ? `/blog?${s}` : '/blog');
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 border border-black/10 rounded-xl px-4 py-2 flex-grow max-w-sm bg-white"
      >
        <Search size={16} className="text-brand-primary/40" />
        <input
          type="text"
          placeholder="Search articles..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="bg-transparent text-sm outline-none flex-grow placeholder:text-brand-primary/40"
        />
        {q && (
          <button type="button" onClick={clear} aria-label="Clear search">
            <X size={14} className="text-brand-primary/40" />
          </button>
        )}
      </form>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat === 'All' ? null : ICONS[cat];
          const active = activeCategory === cat;
          return (
            <Link
              key={cat}
              href={buildHref(cat)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all',
                active
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-paper border border-black/10 text-brand-primary/70 hover:border-brand-accent'
              )}
            >
              {Icon && <Icon size={14} />} {cat}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
