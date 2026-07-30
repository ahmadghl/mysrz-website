import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Route, Compass, Plane, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/utils';
import { TOURS, pkr } from '@/lib/tours';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';
import { AureateButton } from '@/components/aureate/AureateButton';

export const metadata: Metadata = {
  title: 'Tours & Packages — Private Northern Pakistan Trips',
  description:
    'Guided tours of northern Pakistan by mySRZ — Naran, Swat, Hunza, Skardu, Deosai and Kashmir. Fixed public departures and fully private, custom trips. See the day-by-day itinerary, prices and the full PDF.',
  alternates: { canonical: '/tours' },
};

const HERO = `${TOURS[4].image}`;

function enquire(text: string): string {
  return `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

const DIFFERENTIATORS = [
  {
    icon: Route,
    title: 'Private, at your pace',
    desc: 'On a custom trip the vehicle, the driver and the plan are yours. Start early, linger where the light is good, change the day as you go.',
  },
  {
    icon: Compass,
    title: 'Led by locals',
    desc: 'We drive these valleys every season, not a call centre a thousand miles away. You get honest routes, real advice and the quiet stops most tours miss.',
  },
  {
    icon: Plane,
    title: 'Fly or drive',
    desc: 'Fly one way to Gilgit or Skardu to save two long days on the road, then drive the other for the scenery. We build the trip around your time.',
  },
];

export default function ToursPage() {
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'mySRZ Tours & Packages',
    itemListElement: TOURS.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE.url}/tours/${t.slug}`,
      item: {
        '@type': 'TouristTrip',
        name: `${t.name} — ${t.days} Days Tour`,
        description: t.tagline,
        url: `${SITE.url}/tours/${t.slug}`,
        provider: { '@type': 'TravelAgency', name: SITE.name, url: SITE.url },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Breadcrumbs
        items={[{ label: 'Home', href: '/' }, { label: 'Tours' }]}
        hideVisual
      />

      {/* ───── HERO ───── */}
      <section className="relative flex h-[58vh] min-h-[420px] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={HERO}
            alt=""
            fill
            priority
            sizes="100vw"
            aria-hidden="true"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-aureate-background/40 via-aureate-background/20 to-aureate-background" />
        </div>
        <RevealOnScroll className="relative z-10 mx-auto w-full max-w-aureate-container px-aureate-mobile md:px-aureate-desktop">
          <div className="max-w-2xl">
            <span className="mb-4 block font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">
              Tours &amp; Packages
            </span>
            <h1 className="mb-8 font-aureate-display text-aureate-display-lg-mobile italic leading-tight text-aureate-on-surface md:text-aureate-display-lg">
              Private journeys through northern Pakistan
            </h1>
            <div className="mb-8 h-px w-24 bg-aureate-primary-container" />
            <p className="font-aureate-body text-aureate-body-lg text-aureate-on-surface-variant">
              Hand-built trips led by people who drive these valleys every
              season. Open any tour for the full day-by-day itinerary, the
              prices and exactly what is included.
            </p>
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── HOW WE TRAVEL ───── */}
      <section className="bg-aureate-surface-container-low py-20 md:py-28">
        <div className="mx-auto max-w-aureate-container px-aureate-mobile md:px-aureate-desktop">
          <RevealOnScroll className="mb-14 text-center">
            <h2 className="mb-4 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
              How we travel
            </h2>
            <p className="mx-auto max-w-xl font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
              What makes a mySRZ trip different
            </p>
          </RevealOnScroll>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {DIFFERENTIATORS.map(({ icon: Icon, title, desc }, i) => (
              <RevealOnScroll key={title} delay={i * 100}>
                <div className="flex h-full flex-col border border-aureate-outline-variant bg-aureate-surface p-10 transition-all duration-500 hover:-translate-y-1 hover:border-aureate-primary hover:shadow-xl">
                  <Icon
                    size={30}
                    className="mb-6 text-aureate-primary"
                    aria-hidden="true"
                  />
                  <h3 className="mb-4 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                    {title}
                  </h3>
                  <p className="font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
                    {desc}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PACKAGES ───── */}
      <section className="mx-auto max-w-aureate-container px-aureate-mobile py-24 md:px-aureate-desktop md:py-32">
        <RevealOnScroll className="mb-6">
          <div className="flex items-end justify-between">
            <h2 className="font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
              Public tours
            </h2>
            <div className="hidden h-px flex-grow bg-aureate-outline-variant md:ml-12 md:block" />
          </div>
          <p className="mt-4 max-w-2xl font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
            Set routes on fixed departures, priced per person. Open any tour for
            the day-by-day plan, what is and is not included, and the full PDF.
            Prefer your own dates and vehicle? See the custom trips below.
          </p>
        </RevealOnScroll>

        <div className="mt-12 grid grid-cols-1 gap-aureate-gutter md:grid-cols-2">
          {TOURS.map((t, i) => (
            <RevealOnScroll key={t.slug} delay={(i % 2) * 100}>
              <Link
                href={`/tours/${t.slug}`}
                className="group flex h-full flex-col overflow-hidden border border-aureate-outline-variant bg-aureate-surface transition-all duration-500 hover:-translate-y-1 hover:border-aureate-primary hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={t.image}
                    alt={`${t.name}, northern Pakistan`}
                    fill
                    sizes="(max-width: 768px) 100vw, 46vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-0 top-0 m-4 inline-flex items-center gap-1.5 bg-aureate-primary px-3 py-1.5 font-aureate-label text-aureate-label-sm uppercase tracking-widest text-aureate-on-primary">
                    <Clock size={12} aria-hidden="true" /> {t.days} Days
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-8 md:p-10">
                  <span className="mb-2 inline-flex items-center gap-1.5 font-aureate-label text-aureate-label-sm uppercase tracking-widest text-aureate-primary">
                    <MapPin size={12} aria-hidden="true" /> {t.region}
                  </span>
                  <h3 className="mb-3 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                    {t.name}
                  </h3>
                  <p className="mb-6 font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
                    {t.tagline}
                  </p>

                  <ul className="mb-8 space-y-2.5">
                    {t.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-3 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant"
                      >
                        <span
                          className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-aureate-primary"
                          aria-hidden="true"
                        />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-end justify-between border-t border-aureate-outline-variant pt-6">
                    <div>
                      <span className="block font-aureate-label text-aureate-label-sm uppercase tracking-widest text-aureate-on-surface-variant">
                        From
                      </span>
                      <span className="font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                        PKR {pkr(t.prices.solo)}
                      </span>
                      <span className="ml-1 font-aureate-body text-aureate-body-sm text-aureate-on-surface-variant">
                        / person
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary transition-transform duration-300 group-hover:translate-x-1">
                      View tour <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* ───── CUSTOM / PRIVATE ───── */}
      <section className="border-t border-aureate-outline-variant bg-aureate-surface-container-low py-24 md:py-32">
        <RevealOnScroll className="mx-auto max-w-3xl px-aureate-mobile text-center md:px-aureate-desktop">
          <span className="mb-4 block font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">
            Custom &amp; Private
          </span>
          <h2 className="mb-4 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
            Or travel on your own dates
          </h2>
          <p className="mb-8 font-aureate-body text-aureate-body-lg italic leading-relaxed text-aureate-on-surface-variant">
            Every route above can run privately on the dates you choose, with
            your own vehicle and driver, and we build fully custom trips from
            scratch. Solo, couple or family, with a fly-one-way option to save
            the long road days. Tell us what you have in mind and we will send a
            tailored plan and quote.
          </p>
          <div className="flex flex-col justify-center gap-4 md:flex-row md:gap-6">
            <AureateButton
              href={enquire(
                "Hi mySRZ 👋 I'd like to plan a custom or private northern Pakistan trip.",
              )}
              external
              variant="primary"
            >
              Plan a custom trip
            </AureateButton>
            <AureateButton href="/destinations" variant="outline-on-light">
              Browse destinations
            </AureateButton>
          </div>
        </RevealOnScroll>
      </section>
    </>
  );
}
