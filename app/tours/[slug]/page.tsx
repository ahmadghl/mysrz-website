import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  Clock,
  Moon,
  MapPin,
  Check,
  X,
  Info,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { SITE } from '@/lib/utils';
import { TOURS, getTour, pkr } from '@/lib/tours';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';
import { AureateButton } from '@/components/aureate/AureateButton';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return TOURS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) return { title: 'Tour not found' };
  return {
    title: `${tour.name} — ${tour.days} Days Tour, Northern Pakistan`,
    description: `${tour.tagline} A ${tour.days}-day guided ${tour.name} tour by mySRZ. See the day-by-day itinerary, what is included, prices and the full PDF.`,
    alternates: { canonical: `/tours/${tour.slug}` },
  };
}

function waEnquire(name: string, days: number): string {
  return `${SITE.whatsapp}?text=${encodeURIComponent(
    `Hi mySRZ 👋 I'd like the full itinerary and a quote for the ${name} (${days} Days) tour.`,
  )}`;
}

function emailEnquire(name: string, days: number): string {
  const subject = `Itinerary request: ${name} (${days} Days)`;
  const body = `Hi mySRZ,\n\nI'd like the full itinerary and a quote for the ${name} (${days} Days) tour.\n\nRough dates: \nNumber of travellers: \nArriving from: `;
  return `mailto:${SITE.email}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

const TIERS: { key: 'solo' | 'couple' | 'deluxe'; label: string; note: string }[] =
  [
    { key: 'solo', label: 'Solo', note: 'per person, group seat' },
    { key: 'couple', label: 'Couple', note: 'total for two, private room' },
    { key: 'deluxe', label: 'Deluxe', note: 'premium private' },
  ];

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: `${tour.name} — ${tour.days} Days Tour`,
    description: tour.tagline,
    url: `${SITE.url}/tours/${tour.slug}`,
    provider: { '@type': 'TravelAgency', name: SITE.name, url: SITE.url },
    offers: {
      '@type': 'Offer',
      price: tour.prices.solo,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
    },
    itinerary: {
      '@type': 'ItemList',
      itemListElement: tour.itinerary.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: d.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Tours', href: '/tours' },
          { label: tour.name },
        ]}
        hideVisual
      />

      {/* ───── HERO ───── */}
      <section className="relative flex h-[60vh] min-h-[440px] items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={tour.image}
            alt={`${tour.name}, northern Pakistan`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-aureate-background/10 via-aureate-background/30 to-aureate-background" />
        </div>
        <RevealOnScroll className="relative z-10 mx-auto w-full max-w-aureate-container px-aureate-mobile pb-14 md:px-aureate-desktop md:pb-20">
          <span className="mb-3 inline-flex items-center gap-1.5 font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">
            <MapPin size={14} aria-hidden="true" /> {tour.region}
          </span>
          <h1 className="mb-4 max-w-3xl font-aureate-display text-aureate-display-lg-mobile italic leading-tight text-aureate-on-surface md:text-aureate-display-lg">
            {tour.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant">
            <span className="inline-flex items-center gap-2">
              <Clock size={14} aria-hidden="true" /> {tour.days} Days
            </span>
            <span className="inline-flex items-center gap-2">
              <Moon size={14} aria-hidden="true" /> {tour.nights} Nights
            </span>
            <span className="text-aureate-primary">
              From PKR {pkr(tour.prices.solo)} / person
            </span>
          </div>
        </RevealOnScroll>
      </section>

      {/* ───── BODY ───── */}
      <div className="mx-auto max-w-aureate-container px-aureate-mobile py-16 md:px-aureate-desktop md:py-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-aureate-gutter">
          {/* MAIN */}
          <div className="lg:col-span-8">
            <RevealOnScroll>
              <p className="mb-14 font-aureate-body text-aureate-body-lg italic leading-relaxed text-aureate-on-surface-variant">
                {tour.tagline}
              </p>
            </RevealOnScroll>

            {/* ITINERARY */}
            <RevealOnScroll>
              <h2 className="mb-8 font-aureate-headline text-aureate-headline-lg-mobile text-aureate-on-surface md:text-aureate-headline-lg">
                The itinerary
              </h2>
              <ol className="relative space-y-8 border-l border-aureate-outline-variant pl-8">
                {tour.itinerary.map((d) => (
                  <li key={d.title} className="relative">
                    <span
                      className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-aureate-primary bg-aureate-background"
                      aria-hidden="true"
                    >
                      <span className="h-2 w-2 rounded-full bg-aureate-primary" />
                    </span>
                    <h3 className="mb-2 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                      {d.title}
                    </h3>
                    <p className="font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
                      {d.body}
                    </p>
                  </li>
                ))}
              </ol>
            </RevealOnScroll>

            {/* INCLUDES / EXCLUDES */}
            <RevealOnScroll>
              <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
                <div>
                  <h2 className="mb-5 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                    What is included
                  </h2>
                  <ul className="space-y-3">
                    {tour.includes.map((x) => (
                      <li
                        key={x}
                        className="flex items-start gap-3 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant"
                      >
                        <Check
                          size={18}
                          className="mt-0.5 flex-none text-aureate-primary"
                          aria-hidden="true"
                        />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="mb-5 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                    Not included
                  </h2>
                  <ul className="space-y-3">
                    {tour.excludes.map((x) => (
                      <li
                        key={x}
                        className="flex items-start gap-3 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant"
                      >
                        <X
                          size={18}
                          className="mt-0.5 flex-none text-aureate-on-surface-variant/60"
                          aria-hidden="true"
                        />
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </RevealOnScroll>

            {/* GOOD TO KNOW */}
            <RevealOnScroll>
              <div className="mt-16">
                <h2 className="mb-5 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                  Good to know
                </h2>
                <ul className="space-y-3">
                  {tour.goodToKnow.map((x) => (
                    <li
                      key={x}
                      className="flex items-start gap-3 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant"
                    >
                      <Info
                        size={18}
                        className="mt-0.5 flex-none text-aureate-primary"
                        aria-hidden="true"
                      />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          </div>

          {/* SIDEBAR — pricing + enquiry */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <RevealOnScroll>
                <div className="border border-aureate-outline-variant bg-aureate-surface p-8">
                  <h2 className="mb-1 font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                    Prices
                  </h2>
                  <p className="mb-6 font-aureate-body text-aureate-body-sm text-aureate-on-surface-variant">
                    Per the tier, in PKR. Jeep hire and entry fees are not
                    included.
                  </p>
                  <div className="space-y-3">
                    {TIERS.map((tier) => (
                      <div
                        key={tier.key}
                        className="flex items-baseline justify-between border-b border-aureate-outline-variant pb-3 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <span className="block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface">
                            {tier.label}
                          </span>
                          <span className="font-aureate-body text-aureate-body-sm text-aureate-on-surface-variant">
                            {tier.note}
                          </span>
                        </div>
                        <span className="font-aureate-headline text-aureate-headline-md text-aureate-primary">
                          {pkr(tour.prices[tier.key])}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <AureateButton
                      href={waEnquire(tour.name, tour.days)}
                      external
                      variant="primary"
                      className="w-full"
                    >
                      <MessageCircle size={16} className="mr-2" aria-hidden="true" />
                      Enquire on WhatsApp
                    </AureateButton>
                    <AureateButton
                      href={emailEnquire(tour.name, tour.days)}
                      external
                      variant="outline-on-light"
                      className="w-full"
                    >
                      <Mail size={16} className="mr-2" aria-hidden="true" /> Enquire
                      by email
                    </AureateButton>
                    <p className="mt-1 text-center font-aureate-body text-aureate-body-sm text-aureate-on-surface-variant">
                      We reply with the full PDF itinerary and confirm your
                      dates.
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-center font-aureate-body text-aureate-body-sm text-aureate-on-surface-variant">
                  Want your own dates and a private vehicle?{' '}
                  <a
                    href={waEnquire(tour.name + ' (private)', tour.days)}
                    className="whitespace-nowrap underline decoration-aureate-outline-variant underline-offset-4 transition-colors hover:text-aureate-primary hover:decoration-aureate-primary"
                  >
                    Ask for a private quote.
                  </a>
                </p>
              </RevealOnScroll>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
