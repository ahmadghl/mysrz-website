import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getAllPosts } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { BlogFilters } from '@/components/BlogFilters';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';
import type { Category } from '@/lib/types';

export const revalidate = 60;

const CATEGORIES: Category[] = ['All', 'Adventure', 'Culture', 'Food', 'Nature'];

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const requested = (sp.category as Category) ?? 'All';
  const activeCategory: Category = CATEGORIES.includes(requested) ? requested : 'All';
  const query = (sp.q ?? '').trim();
  // Noindex any filtered variant so Google only indexes the canonical /blog
  // page. The category and search forms are user-facing controls, not
  // content surfaces we want crawled separately.
  const isFiltered = activeCategory !== 'All' || query.length > 0;

  return {
    title: 'Pakistan Travel Journal — Tips, Guides & Stories',
    description:
      'In-depth Pakistan travel guides, destination stories, food discoveries and adventure tips written by local expert Ahmad Faraz.',
    alternates: { canonical: '/blog' },
    keywords: [
      'Pakistan travel blog',
      'Pakistan travel guide',
      'Hunza guide',
      'Skardu guide',
      'Pakistan adventure travel',
    ],
    robots: isFiltered ? { index: false, follow: true } : undefined,
  };
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

  // The unfiltered, unsearched journal lists a "feature story" as
  // the editorial centerpiece. When filters are active, skip the
  // feature and just show the grid.
  const isCanonical = activeCategory === 'All' && !query;
  const featured = isCanonical ? filtered[0] : null;
  const gridPosts = featured ? filtered.slice(1) : filtered;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Journal' },
        ]}
        hideVisual
      />

      {/* ───── HEADER ───── */}
      <RevealOnScroll
        as="section"
        className="mx-auto max-w-aureate-container px-aureate-mobile pt-16 md:px-aureate-desktop md:pt-24"
      >
        <div className="mb-12 max-w-3xl">
          <span className="mb-4 block font-aureate-label text-aureate-label-md uppercase tracking-[0.2em] text-aureate-primary">
            Chronicles of Heritage
          </span>
          <h1 className="mb-6 font-aureate-display text-aureate-display-lg-mobile leading-tight text-aureate-on-surface md:text-aureate-display-lg">
            The Journal
          </h1>
          <p className="font-aureate-body text-aureate-body-lg italic text-aureate-on-surface-variant">
            Reflections on craftsmanship, culture, and the timeless landscapes
            of Pakistan.
          </p>
        </div>

        <BlogFilters activeCategory={activeCategory} initialQuery={query} />
      </RevealOnScroll>

      <div className="mx-auto max-w-aureate-container px-aureate-mobile pb-24 md:px-aureate-desktop">
        {filtered.length === 0 ? (
          <div className="py-24 text-center text-aureate-on-surface-variant/50">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-aureate-body text-aureate-body-md">
              No articles found. Try a different search.
            </p>
          </div>
        ) : (
          <>
            {/* ───── FEATURED STORY ───── */}
            {featured && (
              <RevealOnScroll
                as="section"
                className="mb-20 border border-aureate-outline-variant bg-aureate-surface"
              >
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid grid-cols-1 transition-shadow duration-500 hover:shadow-2xl lg:grid-cols-12"
                >
                  <div className="relative h-[400px] overflow-hidden lg:col-span-7 lg:h-[600px]">
                    <Image
                      src={featured.image_url}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      priority
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-10 lg:col-span-5 lg:p-16">
                    <span className="mb-4 font-aureate-label text-aureate-label-md uppercase tracking-[0.2em] text-aureate-primary">
                      Feature Story · {featured.category}
                    </span>
                    <h2 className="mb-6 font-aureate-headline text-aureate-headline-lg-mobile leading-tight text-aureate-on-surface md:text-aureate-headline-lg">
                      {featured.title}
                    </h2>
                    <p className="mb-8 line-clamp-4 font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
                      {featured.excerpt}
                    </p>
                    <span className="group/link inline-flex w-fit items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                      Read More
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover/link:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              </RevealOnScroll>
            )}

            {/* ───── BENTO GRID ───── */}
            <div className="grid grid-cols-1 gap-aureate-gutter md:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post, i) => (
                <RevealOnScroll key={post.id} delay={i < 6 ? (i % 3) * 100 : 0}>
                  <PostCard post={post} />
                </RevealOnScroll>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
