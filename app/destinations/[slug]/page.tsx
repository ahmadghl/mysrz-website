import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Calendar, Camera, MapPin } from 'lucide-react';
import {
  getAllDestinations,
  getDestinationBySlug,
  getDestinationSlugs,
} from '@/lib/destinations';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FaqSection } from '@/components/FaqSection';
import { SITE } from '@/lib/utils';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';
import { PaperStack } from '@/components/aureate/PaperStack';
import { AureateButton } from '@/components/aureate/AureateButton';

// ISR: cache rendered HTML at the edge. Admin publishes call
// /api/revalidate which fires revalidateTag('destinations') +
// revalidatePath to purge instantly; the 60s window below is just a
// safety net. Known slugs prerender at build via generateStaticParams;
// unknown slugs render on demand and notFound() still emits a real 404.
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getDestinationSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return { title: 'Destination not found' };

  const rawDescription = dest.meta_description?.trim() || dest.description;
  const description =
    rawDescription.length > 160
      ? `${rawDescription.slice(0, rawDescription.lastIndexOf(' ', 157))}…`
      : rawDescription;

  const title = dest.meta_title?.trim() || `${dest.name} Travel Guide — ${dest.region}`;

  return {
    title,
    description,
    alternates: { canonical: `/destinations/${dest.slug}` },
    keywords: [
      dest.name,
      `${dest.name} travel guide`,
      `${dest.name} Pakistan`,
      'Pakistan destinations',
      dest.region,
      ...dest.tags,
    ],
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/destinations/${dest.slug}`,
      images: dest.image_url
        ? [{ url: dest.image_url, width: 1200, height: 800, alt: dest.name }]
        : undefined,
      locale: 'en_US',
      siteName: SITE.name,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: dest.image_url ? [dest.image_url] : undefined,
    },
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  // Parallelize the lookup + the all-destinations list (used to pick
  // related). Both go through React.cache + the data cache, but
  // Promise.all hides the round-trip on cold caches.
  const [dest, all] = await Promise.all([
    getDestinationBySlug(slug),
    getAllDestinations(),
  ]);
  if (!dest) notFound();

  const related = all
    .filter((d) => d.slug !== dest.slug && d.region === dest.region)
    .slice(0, 3);

  const url = `${SITE.url}/destinations/${dest.slug}`;

  const attractionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: dest.name,
    description: dest.description,
    url,
    ...(dest.image_url ? { image: dest.image_url } : {}),
    address: {
      '@type': 'PostalAddress',
      addressRegion: dest.region,
      addressCountry: 'PK',
    },
    touristType: dest.tags,
    isAccessibleForFree: true,
  };

  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: dest.name,
    description: dest.description,
    address: {
      '@type': 'PostalAddress',
      addressRegion: dest.region,
      addressCountry: 'PK',
    },
    ...(dest.image_url ? { photo: dest.image_url } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(attractionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Destinations', href: '/destinations' },
          { label: dest.name },
        ]}
        hideVisual
      />

      {/* ───── CINEMATIC HERO ───── */}
      <header className="relative flex h-[90vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {dest.image_url ? (
            <Image
              src={dest.image_url}
              alt={dest.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(at 30% 20%, rgba(118,90,10,0.35), transparent 55%), radial-gradient(at 80% 100%, rgba(118,90,10,0.15), transparent 60%), #1d1c13',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-aureate-on-surface/40 to-aureate-on-surface/10" />
        </div>

        <RevealOnScroll className="relative z-10 px-aureate-mobile text-center text-white md:px-aureate-desktop">
          {dest.region && (
            <span className="mb-6 block font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary-fixed-dim">
              {dest.region}
            </span>
          )}
          <h1 className="mb-8 font-aureate-display text-aureate-display-lg-mobile leading-none text-white md:text-aureate-display-lg">
            {dest.name}
          </h1>
          <div className="mx-auto h-px w-16 bg-aureate-primary-fixed-dim" />
        </RevealOnScroll>
      </header>

      {/* ───── QUICK STATS ───── */}
      <section className="border-b border-aureate-outline-variant bg-aureate-surface">
        <RevealOnScroll className="mx-auto max-w-aureate-container px-aureate-mobile py-12 md:px-aureate-desktop">
          <div className="grid grid-cols-2 gap-aureate-gutter text-center md:grid-cols-4">
            {dest.region && <Stat label="Region" value={dest.region} />}
            {dest.best_time && <Stat label="Best Visit" value={dest.best_time} />}
            {dest.tags[0] && <Stat label="Highlight" value={dest.tags[0]} />}
            <Stat
              label="Access"
              value="Open to All"
            />
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── STORYTELLING ───── */}
      <section className="mx-auto max-w-aureate-container overflow-hidden px-aureate-mobile py-24 md:px-aureate-desktop">
        <RevealOnScroll>
          <div className="grid grid-cols-1 items-center gap-16 md:grid-cols-12">
            <div className="space-y-8 md:col-span-5">
              <div className="h-1 w-12 bg-aureate-primary" />
              <h2 className="font-aureate-headline text-aureate-headline-lg-mobile leading-tight text-aureate-on-surface md:text-aureate-headline-lg">
                {dest.name}
                <br />
                <span className="italic text-aureate-on-surface-variant">
                  &mdash; at a glance
                </span>
              </h2>
              <p className="font-aureate-body text-aureate-body-lg leading-relaxed text-aureate-on-surface-variant">
                {dest.description}
              </p>

              {dest.tags.length > 0 && (
                <div className="space-y-3">
                  <span className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                    What to expect
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dest.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-aureate-outline-variant bg-aureate-surface px-4 py-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <AureateButton href="/contact" variant="outline-on-light">
                  Plan This Trip
                </AureateButton>
              </div>
            </div>

            <div className="md:col-span-7">
              <PaperStack className="group cursor-default overflow-hidden">
                {dest.image_url ? (
                  <Image
                    src={dest.image_url}
                    alt={dest.name}
                    width={1200}
                    height={1500}
                    sizes="(max-width: 768px) 100vw, 58vw"
                    className="aspect-[4/5] w-full object-cover grayscale-[15%] shadow-sm transition-all duration-700 group-hover:scale-[1.02] group-hover:grayscale-0 group-hover:shadow-xl"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full bg-aureate-surface-container-high" />
                )}
              </PaperStack>
              {dest.image_credit?.name && (
                <p className="mt-4 flex items-center gap-1.5 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant/70">
                  <Camera size={11} aria-hidden="true" />
                  Photo by{' '}
                  {dest.image_credit.instagram ||
                  dest.image_credit.twitter ||
                  dest.image_credit.website ? (
                    <a
                      href={
                        dest.image_credit.instagram ||
                        dest.image_credit.twitter ||
                        dest.image_credit.website
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-2 hover:text-aureate-primary hover:underline"
                    >
                      {dest.image_credit.name}
                    </a>
                  ) : (
                    <span>{dest.image_credit.name}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── FAQ ───── */}
      <section className="mx-auto max-w-3xl px-aureate-mobile pb-16 md:px-aureate-desktop">
        <FaqSection faqs={dest.faqs ?? []} />
      </section>

      {/* ───── RELATED ───── */}
      {related.length > 0 && (
        <section className="bg-aureate-surface-container-low py-24">
          <RevealOnScroll className="mx-auto max-w-aureate-container px-aureate-mobile md:px-aureate-desktop">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <span className="mb-2 block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                  Continue Exploring
                </span>
                <h2 className="font-aureate-headline text-aureate-headline-md text-aureate-on-surface md:text-aureate-headline-lg">
                  Other destinations in {dest.region}
                </h2>
              </div>
              <Link
                href="/destinations"
                className="group hidden items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary md:inline-flex"
              >
                All Regions
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-aureate-gutter md:grid-cols-3">
              {related.map((r, i) => (
                <RevealOnScroll key={r.slug} delay={i * 100}>
                  <Link href={`/destinations/${r.slug}`} className="group block">
                    <div className="relative mb-5 aspect-[4/5] overflow-hidden shadow-sm transition-shadow duration-500 group-hover:shadow-xl">
                      {r.image_url ? (
                        <Image
                          src={r.image_url}
                          alt={r.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-aureate-surface-container-high" />
                      )}
                    </div>
                    {r.region && (
                      <div className="mb-2 flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                        <MapPin size={12} aria-hidden="true" /> {r.region}
                      </div>
                    )}
                    <h3 className="font-aureate-headline text-xl text-aureate-on-surface transition-colors duration-300 group-hover:text-aureate-primary">
                      {r.name}
                    </h3>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </RevealOnScroll>
        </section>
      )}

      {/* ───── BOTTOM CTA ───── */}
      <section className="py-24 md:py-32">
        <RevealOnScroll className="mx-auto max-w-2xl px-aureate-mobile text-center md:px-aureate-desktop">
          <Calendar
            size={36}
            className="mx-auto mb-6 text-aureate-primary"
            aria-hidden="true"
          />
          <h2 className="mb-6 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
            Want a tailored itinerary for {dest.name}?
          </h2>
          <p className="mb-10 font-aureate-body text-aureate-body-lg text-aureate-on-surface-variant">
            We&apos;ll handle the logistics. You focus on the journey.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            <AureateButton href="/contact" variant="primary">
              Start a Trip
            </AureateButton>
            <AureateButton href="/destinations" variant="outline-on-light">
              Browse All Regions
            </AureateButton>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
        {label}
      </p>
      <p className="font-aureate-headline text-xl text-aureate-on-surface md:text-aureate-headline-md">
        {value}
      </p>
    </div>
  );
}
