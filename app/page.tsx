import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  MapPin,
  Phone,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { getAllPosts } from '@/lib/posts';
import { getAllDestinations } from '@/lib/destinations';
import { getSiteSettings } from '@/lib/site-settings';
import { getLiveStats } from '@/lib/live-stats';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';
import { PaperStack } from '@/components/aureate/PaperStack';
import { AureateButton } from '@/components/aureate/AureateButton';
import { HeroSlideshow } from '@/components/aureate/HeroSlideshow';
import { HERO_SLIDES } from '@/lib/hero-slides';

export const revalidate = 60;

// Map admin-supplied icon strings to Lucide components for the
// stats row. Unknown values fall back to MapPin so a malformed
// admin entry can't crash the page.
const STAT_ICONS: Record<string, LucideIcon> = {
  MapPin,
  BookOpen,
  Users,
};

export default async function HomePage() {
  // Parallel fetch — same React.cache()-deduped accessors as before.
  // getLiveStats() reuses getAllPosts/getAllDestinations internally so
  // there is no double-fetch.
  const [posts, allDestinations, settings, liveStats] = await Promise.all([
    getAllPosts(),
    getAllDestinations(),
    getSiteSettings(),
    getLiveStats(),
  ]);

  const featuredDestinations = allDestinations.slice(0, 3);
  const featuredPosts = posts.slice(0, 3);
  const philosophyImage = featuredPosts[0]?.image_url ?? settings.hero_image_url;

  // Use real DB-backed stats. liveStats.homepage already has rating removed
  // and all values computed from live data (see lib/live-stats.ts).
  const heroStats = liveStats.homepage;

  return (
    <>
      {/* ───── IMMERSIVE HERO ─────
          Crossfading slideshow of the eight flagship cities (see
          lib/hero-slides.ts). First slide is the LCP image with
          priority — same cost as the old single-image hero. The
          admin's hero_image_url setting is no longer used here;
          swap slides by editing lib/hero-slides.ts. */}
      <header className="relative flex h-[90vh] w-full items-center justify-center overflow-hidden">
        <HeroSlideshow slides={HERO_SLIDES} />

        <RevealOnScroll className="relative z-10 max-w-4xl px-aureate-mobile text-center md:px-aureate-desktop">
          <span className="mb-6 block font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary-fixed-dim">
            {settings.hero_kicker}
          </span>
          <h1 className="mb-10 font-aureate-display text-aureate-display-lg-mobile leading-tight text-white md:text-aureate-display-lg">
            {settings.hero_title_line_1}{' '}
            <span className="italic">{settings.hero_title_line_2}</span>{' '}
            {settings.hero_title_line_3}
          </h1>
          <p className="mx-auto mb-10 max-w-xl font-aureate-body text-aureate-body-lg text-white/85">
            {settings.hero_subtitle}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <AureateButton href={settings.hero_cta_primary_href} variant="primary">
              {settings.hero_cta_primary_text}
            </AureateButton>
            <AureateButton
              href={settings.hero_cta_secondary_href}
              variant="outline-on-dark"
            >
              {settings.hero_cta_secondary_text}
            </AureateButton>
          </div>
        </RevealOnScroll>

        {/* Scroll-indicator anchor pointing into the stats row.
            Pure decoration — keyboard users get nothing extra here. */}
        <div
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 opacity-80"
        >
          <span className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-white/60">
            Discover
          </span>
          <ChevronDown size={20} className="text-white/60" />
        </div>
      </header>

      {/* ───── STATS / IMPACT ROW ───── */}
      <section className="border-b border-aureate-outline-variant bg-aureate-background">
        <RevealOnScroll className="mx-auto max-w-aureate-container px-aureate-mobile py-16 md:px-aureate-desktop md:py-24">
          <div className="grid grid-cols-1 gap-aureate-gutter text-center md:grid-cols-3">
            {heroStats.map(({ value, label, icon }, i) => {
              const Icon = (icon && STAT_ICONS[icon]) || MapPin;
              const isLast = i === heroStats.length - 1;
              return (
                <div
                  key={label}
                  className={`p-8 transition-colors duration-500 hover:bg-aureate-surface-container-low md:border-r md:border-aureate-outline-variant ${
                    isLast ? 'md:border-r-0' : ''
                  }`}
                >
                  <Icon
                    size={24}
                    className="mx-auto mb-3 text-aureate-primary"
                    aria-hidden="true"
                  />
                  <h3 className="mb-2 font-aureate-display text-aureate-headline-lg text-aureate-primary">
                    {value}
                  </h3>
                  <p className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── CURATED ODYSSEYS (FEATURED DESTINATIONS) ───── */}
      <section className="bg-aureate-background">
        <div className="mx-auto max-w-aureate-container px-aureate-mobile py-24 md:px-aureate-desktop md:py-32">
          <RevealOnScroll className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="mb-3 block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                Where to Go
              </span>
              <h2 className="mb-4 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
                Curated Odysseys
              </h2>
              <p className="font-aureate-body text-aureate-body-lg text-aureate-on-surface-variant">
                Journey across landscapes that have shaped centuries of stories
                — from the Karakoram peaks to the Indus heartlands.
              </p>
            </div>
            <Link
              href="/destinations"
              className="group flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary transition-colors hover:text-aureate-on-secondary-container"
            >
              All Destinations
              <ChevronRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </RevealOnScroll>

          {featuredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 gap-aureate-gutter md:grid-cols-3 md:gap-12">
              {featuredDestinations.map((dest, i) => (
                <RevealOnScroll
                  as="article"
                  key={dest.slug}
                  delay={i * 100}
                  // Staggered translate-y on the middle card makes
                  // the trio feel editorial instead of a flat grid.
                  className={i === 1 ? 'md:translate-y-12' : ''}
                >
                  <Link href={`/destinations/${dest.slug}`} className="group block">
                    <div className="relative mb-6 h-[400px] overflow-hidden md:h-[500px]">
                      {dest.image_url ? (
                        <Image
                          src={dest.image_url}
                          alt={dest.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 bg-aureate-surface-container-high"
                        />
                      )}
                      <div className="absolute inset-0 bg-aureate-on-surface/20 transition-colors duration-700 group-hover:bg-aureate-on-surface/5" />
                    </div>
                    <div className="space-y-3">
                      {dest.region && (
                        <div className="flex items-center gap-2">
                          <span className="h-px w-8 bg-aureate-primary transition-all duration-500 group-hover:w-12" />
                          <span className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                            {dest.region}
                          </span>
                        </div>
                      )}
                      <h3 className="font-aureate-headline text-aureate-headline-md text-aureate-on-surface transition-colors duration-300 group-hover:text-aureate-primary">
                        {dest.name}
                      </h3>
                      {dest.description && (
                        <p className="line-clamp-2 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
                          {dest.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-aureate-on-surface-variant/50">
              <MapPin size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-aureate-body">Destinations coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ───── EDITORIAL / JOURNAL TEASER ───── */}
      {featuredPosts.length > 0 && (
        <section className="mt-20 bg-aureate-surface-container-low py-24 md:py-32">
          <RevealOnScroll className="mx-auto max-w-aureate-container px-aureate-mobile md:px-aureate-desktop">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -left-6 -top-6 h-32 w-32 border-l border-t border-aureate-primary/30 md:h-40 md:w-40"
                />
                <Image
                  src={philosophyImage}
                  alt="Stories from Pakistan"
                  width={900}
                  height={1100}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="relative z-10 h-auto w-full object-cover"
                />
              </div>
              <div className="space-y-6 md:space-y-8">
                <span className="block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                  The Journal
                </span>
                <h2 className="font-aureate-headline text-aureate-headline-lg-mobile leading-tight text-aureate-on-surface md:text-aureate-headline-lg">
                  Stories from across Pakistan
                </h2>
                <p className="font-aureate-body text-aureate-body-lg text-aureate-on-surface-variant">
                  First-hand accounts from the valleys we cover — what to see,
                  when to go, and the people whose lives unfold against these
                  landscapes.
                </p>
                <div className="space-y-4 border-l border-aureate-outline-variant pl-6">
                  {featuredPosts.slice(0, 3).map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant">
                          {post.category}
                        </span>
                        <span className="flex items-center gap-2 font-aureate-label text-aureate-label-md text-aureate-on-surface-variant/60">
                          <Eye size={12} aria-hidden="true" />
                          {post.views.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="mt-1 font-aureate-headline text-aureate-headline-md text-aureate-on-surface transition-colors duration-300 group-hover:text-aureate-primary">
                        {post.title}
                      </h3>
                    </Link>
                  ))}
                </div>
                <div className="pt-2">
                  <AureateButton href="/blog" variant="secondary">
                    Read the Journal
                  </AureateButton>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </section>
      )}

      {/* ───── PLAN-A-TRIP / CONTACT CTA ───── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <RevealOnScroll className="mx-auto max-w-2xl px-aureate-mobile text-center md:px-aureate-desktop">
          <span className="mb-6 block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
            Get in Touch
          </span>
          <h2 className="mb-6 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
            Plan your Pakistan journey
          </h2>
          <p className="mb-12 font-aureate-body text-aureate-body-lg text-aureate-on-surface-variant">
            Have a region in mind, or want help shaping an itinerary across
            several? Send us the rough sketch and we&apos;ll come back with the
            detail.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <AureateButton href="/contact" variant="primary">
              Start Planning
            </AureateButton>
            <a
              href={settings.phone_link}
              className="inline-flex items-center gap-2 border border-aureate-outline px-10 py-4 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface transition-all duration-300 hover:-translate-y-0.5 hover:border-aureate-primary hover:shadow-md"
            >
              <Phone size={14} aria-hidden="true" />
              {settings.phone_display}
            </a>
          </div>
        </RevealOnScroll>
      </section>
      {/* Floating WhatsApp CTA is rendered site-wide from app/layout.tsx
          (FloatingWhatsApp). The older homepage-only button was removed to
          stop a duplicate FAB overlapping on the homepage. */}
    </>
  );
}
