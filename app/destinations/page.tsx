import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { getAllDestinations } from '@/lib/destinations';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';
import { AureateButton } from '@/components/aureate/AureateButton';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Pakistan Destinations — Mountains, Cities & Culture',
  description:
    "Explore Pakistan's most stunning destinations — Hunza Valley, Skardu, Swat, Lahore, Karachi and more. Detailed guides for every traveller.",
  alternates: { canonical: '/destinations' },
  keywords: [
    'Pakistan destinations',
    'Hunza Valley',
    'Skardu',
    'Swat Valley',
    'Lahore',
    'Karachi',
    'Fairy Meadows',
    'northern Pakistan',
  ],
};

export default async function DestinationsPage() {
  const destinations = await getAllDestinations();
  const [featured, ...rest] = destinations;
  // Two-column secondary grid follows the editorial bento pattern
  // from the design — first card on the left, second on the right,
  // then a third row spans full width as a wide editorial card.
  const secondary = rest.slice(0, 2);
  const remainder = rest.slice(2);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Destinations' },
        ]}
        hideVisual
      />

      {/* ───── HERO ───── */}
      <section className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden bg-aureate-surface-container">
        {featured?.image_url && (
          <Image
            src={featured.image_url}
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
            className="absolute inset-0 object-cover opacity-50 grayscale"
          />
        )}
        <div className="absolute inset-0 bg-aureate-background/40 backdrop-blur-sm" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-aureate-background" />

        <RevealOnScroll className="relative z-10 max-w-3xl px-aureate-mobile text-center md:px-aureate-desktop">
          <span className="mb-6 block font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">
            Grand Expeditions
          </span>
          <h1 className="mb-8 font-aureate-display text-aureate-display-lg-mobile leading-tight text-aureate-on-surface md:text-aureate-display-lg">
            The Regions of <span className="italic">Pakistan</span>
          </h1>
          <div className="mx-auto h-px w-24 bg-aureate-primary" />
          <p className="mx-auto mt-8 max-w-xl font-aureate-body text-aureate-body-lg italic text-aureate-on-surface-variant">
            From the crystalline heights of the Karakoram to the ancient streets
            of the Indus heartlands, discover a landscape of timeless majesty.
          </p>
        </RevealOnScroll>
      </section>

      {/* ───── BENTO / EDITORIAL GRID ───── */}
      <section className="mx-auto max-w-aureate-container px-aureate-mobile py-20 md:px-aureate-desktop md:py-24">
        {destinations.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="mb-3 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
              Destination guides are on the way
            </h2>
            <p className="mx-auto mb-8 max-w-md font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
              We&apos;re writing detailed guides for every corner of Pakistan.
              Check back soon, or read our latest stories on the Journal.
            </p>
            <AureateButton href="/blog" variant="secondary">
              Read the Journal
            </AureateButton>
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            {/* Featured large card — first destination, asymmetric 7/5 split */}
            {featured && (
              <RevealOnScroll as="article" className="grid grid-cols-1 items-center gap-aureate-gutter md:grid-cols-12">
                <Link
                  href={`/destinations/${featured.slug}`}
                  className="group contents"
                >
                  <div className="relative h-[450px] overflow-hidden shadow-sm transition-shadow duration-500 group-hover:shadow-xl md:col-span-7 md:h-[600px]">
                    {featured.image_url ? (
                      <Image
                        src={featured.image_url}
                        alt={featured.name}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 58vw"
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-aureate-surface-container-high" />
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-6 border border-aureate-primary-container/20"
                    />
                  </div>
                  <div className="flex flex-col justify-center md:col-span-5 md:pl-12">
                    {featured.region && (
                      <span className="mb-4 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                        {featured.region}
                      </span>
                    )}
                    <h2 className="mb-6 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
                      {featured.name}
                    </h2>
                    {featured.description && (
                      <p className="mb-8 font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
                        {featured.description}
                      </p>
                    )}
                    <span className="group/link inline-flex w-fit items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface">
                      View Guide
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover/link:translate-x-2"
                      />
                    </span>
                  </div>
                </Link>
              </RevealOnScroll>
            )}

            {/* Secondary two-column row */}
            {secondary.length > 0 && (
              <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
                {secondary.map((dest, i) => (
                  <DestinationCard
                    key={dest.slug}
                    dest={dest}
                    delay={i * 100}
                  />
                ))}
              </div>
            )}

            {/* Remaining destinations — three-column grid */}
            {remainder.length > 0 && (
              <div className="grid grid-cols-1 gap-aureate-gutter md:grid-cols-3">
                {remainder.map((dest, i) => (
                  <CompactDestinationCard
                    key={dest.slug}
                    dest={dest}
                    delay={i * 80}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ───── CTA / Plan a Trip ───── */}
      <section className="mt-20 bg-aureate-surface-container-low py-24">
        <RevealOnScroll className="mx-auto grid max-w-aureate-container grid-cols-1 items-center gap-aureate-gutter px-aureate-mobile md:grid-cols-2 md:px-aureate-desktop">
          <div>
            <h2 className="mb-6 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
              Chart Your Path
            </h2>
            <p className="mb-10 max-w-md font-aureate-body text-aureate-body-lg text-aureate-on-surface-variant">
              Every journey is bespoke. Tell us what you&apos;re drawn to —
              mountains, culture, food, slow trekking — and we&apos;ll shape an
              itinerary around it.
            </p>
            <AureateButton href="/contact" variant="outline-on-light">
              Start a Trip
            </AureateButton>
          </div>
          <div className="relative">
            {featured?.image_url && (
              <div className="group relative aspect-square overflow-hidden border border-aureate-outline-variant bg-aureate-surface-container p-2 shadow-sm">
                <div className="relative h-full w-full overflow-hidden">
                  <Image
                    src={featured.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    aria-hidden="true"
                    className="object-cover opacity-70 mix-blend-multiply grayscale transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="absolute -right-4 -top-4 h-24 w-24 border-r border-t border-aureate-primary-container transition-transform duration-700 group-hover:-translate-y-2 group-hover:translate-x-2"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-4 -left-4 h-24 w-24 border-b border-l border-aureate-primary-container transition-transform duration-700 group-hover:-translate-x-2 group-hover:translate-y-2"
                />
              </div>
            )}
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}

/** Two-column secondary card. Used in the row right after the featured. */
function DestinationCard({
  dest,
  delay,
}: {
  dest: Awaited<ReturnType<typeof getAllDestinations>>[number];
  delay: number;
}) {
  return (
    <RevealOnScroll as="article" delay={delay}>
      <Link href={`/destinations/${dest.slug}`} className="group block">
        <div className="relative mb-8 h-[400px] overflow-hidden shadow-sm transition-shadow duration-500 group-hover:shadow-xl md:h-[500px]">
          {dest.image_url ? (
            <Image
              src={dest.image_url}
              alt={dest.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-aureate-surface-container-high" />
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-6 border border-aureate-primary-container/20"
          />
        </div>
        {dest.region && (
          <span className="mb-3 block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
            {dest.region}
          </span>
        )}
        <h3 className="mb-4 font-aureate-headline text-aureate-headline-md text-aureate-on-surface transition-colors duration-300 group-hover:text-aureate-primary">
          {dest.name}
        </h3>
        {dest.description && (
          <p className="mb-6 line-clamp-3 font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
            {dest.description}
          </p>
        )}
        <span className="group/link inline-flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface">
          Explore
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover/link:translate-x-1"
          />
        </span>
      </Link>
    </RevealOnScroll>
  );
}

/** Compact card for the trailing three-column grid. */
function CompactDestinationCard({
  dest,
  delay,
}: {
  dest: Awaited<ReturnType<typeof getAllDestinations>>[number];
  delay: number;
}) {
  return (
    <RevealOnScroll as="article" delay={delay}>
      <Link href={`/destinations/${dest.slug}`} className="group block">
        <div className="relative mb-5 aspect-[4/5] overflow-hidden shadow-sm transition-shadow duration-500 group-hover:shadow-xl">
          {dest.image_url ? (
            <Image
              src={dest.image_url}
              alt={dest.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 bg-aureate-surface-container-high" />
          )}
          <div className="absolute inset-0 bg-aureate-on-surface/10 transition-colors duration-500 group-hover:bg-transparent" />
        </div>
        {dest.region && (
          <div className="mb-2 flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
            <MapPin size={12} aria-hidden="true" />
            {dest.region}
          </div>
        )}
        <h3 className="font-aureate-headline text-xl text-aureate-on-surface transition-colors duration-300 group-hover:text-aureate-primary">
          {dest.name}
        </h3>
      </Link>
    </RevealOnScroll>
  );
}
