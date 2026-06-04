'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Camera, Leaf, Mountain, Search, Utensils, X } from 'lucide-react';
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

/**
 * Aureate-restyled blog filters. Border-on-surface category pills
 * with underline-on-active, search input as a bordered underline
 * field. URL-building logic unchanged.
 */
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
    <div className="mb-12 flex flex-col gap-6 border-y border-aureate-outline-variant py-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat === 'All' ? null : ICONS[cat];
          const active = activeCategory === cat;
          return (
            <Link
              key={cat}
              href={buildHref(cat)}
              className={cn(
                'inline-flex items-center gap-2 border px-5 py-2 font-aureate-label text-aureate-label-md uppercase tracking-widest transition-all duration-300',
                active
                  ? 'border-aureate-primary bg-aureate-primary text-aureate-on-primary'
                  : 'border-aureate-outline-variant text-aureate-on-surface-variant hover:border-aureate-primary hover:bg-aureate-surface-container hover:text-aureate-primary',
              )}
            >
              {Icon && <Icon size={12} aria-hidden="true" />} {cat}
            </Link>
          );
        })}
      </div>
      <form
        onSubmit={submit}
        className="flex items-center gap-3 border-b border-aureate-outline-variant pb-2 md:max-w-xs"
      >
        <Search size={16} className="text-aureate-on-surface-variant" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search the Journal…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-grow bg-transparent py-1 font-aureate-body text-aureate-body-md text-aureate-on-surface outline-none placeholder:text-aureate-on-surface-variant/60"
        />
        {q && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="text-aureate-on-surface-variant transition-colors hover:text-aureate-primary"
          >
            <X size={14} />
          </button>
        )}
      </form>
    </div>
  );
}
