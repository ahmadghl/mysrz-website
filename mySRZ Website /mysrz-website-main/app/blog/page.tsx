import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { getAllPosts } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { BlogFilters } from '@/components/BlogFilters';
import type { Category } from '@/lib/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Pakistan Travel Blog - Tips, Guides & Stories',
  description:
    'Read in-depth Pakistan travel guides, destination stories, food discoveries and adventure tips written by local expert Ahmad Fraz.',
  alternates: { canonical: '/blog' },
  keywords: [
    'Pakistan travel blog',
    'Pakistan travel guide',
    'Hunza guide',
    'Skardu guide',
    'Pakistan adventure travel',
  ],
};

const CATEGORIES: Category[] = ['All', 'Adventure', 'Culture', 'Food', 'Nature'];

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const requested = (sp.category as Category) ?? 'All';
  const activeCategory: Category = CATEGORIES.includes(requested) ? requested : 'All';
  const query = (sp.q ?? '').trim();
  const queryLower = query.toLowerCase();

  const all = await getAllPosts();
  const filtered = all.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchQ =
      !queryLower ||
      p.title.toLowerCase().includes(queryLower) ||
      p.excerpt.toLowerCase().includes(queryLower);
    return matchCat && matchQ;
  });

  return (
    <>
      <div className="bg-brand-primary text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">Travel Guides & Stories</span>
          <h1 className="text-5xl font-bold mt-3 mb-4">The Blog</h1>
          <p className="text-white/60 max-w-xl">
            In-depth travel guides, cultural insights, food discoveries, and adventure stories from across Pakistan.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogFilters activeCategory={activeCategory} initialQuery={query} />

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-brand-primary/40">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p>No articles found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
