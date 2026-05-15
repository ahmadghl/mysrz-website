import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Calendar, MapPin, Phone, Mail, Camera } from 'lucide-react';
import { getAllDestinations, getDestinationBySlug } from '@/lib/destinations';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SITE } from '@/lib/utils';

// Render dynamically so unknown slugs return a real 404 status code.
// The underlying Supabase fetch is still cached via the `destinations`
// tag (revalidated by /api/revalidate), so the DB is not hit on every
// request — only the React render is per-request.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) return { title: 'Destination not found' };

  const description =
    dest.description.length > 160
      ? `${dest.description.slice(0, dest.description.lastIndexOf(' ', 157))}…`
      : dest.description;

  return {
    title: `${dest.name} Travel Guide — ${dest.region}`,
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
      title: `${dest.name} Travel Guide`,
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
      title: `${dest.name} Travel Guide`,
      description,
      images: dest.image_url ? [dest.image_url] : undefined,
    },
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);
  if (!dest) notFound();

  const all = await getAllDestinations();
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
      />

      <article>
        <div className="relative h-[55vh] overflow-hidden mt-4 bg-brand-primary">
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
            // Fallback when no hero image is set in the admin. Uses brand
            // colors plus a soft radial highlight so the hero doesn't look
            // empty. The admin should still require an image on publish —
            // tracking that as a Phase 3 finding.
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(at 30% 20%, rgba(212,175,55,0.35), transparent 55%), radial-gradient(at 80% 100%, rgba(212,175,55,0.15), transparent 60%), #1a1a1a',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-5xl mx-auto px-4 pb-12 w-full text-white">
              <Link
                href="/destinations"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:gap-4 transition-all uppercase tracking-widest"
              >
                <ArrowRight className="rotate-180" size={16} /> All Destinations
              </Link>
              <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
                <MapPin size={14} className="text-brand-accent" />
                {dest.region}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                {dest.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                {dest.best_time && (
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-brand-accent" /> Best:{' '}
                    {dest.best_time}
                  </span>
                )}
                {dest.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-grow min-w-0">
              <p className="text-lg leading-relaxed text-brand-primary/80">
                {dest.description}
              </p>

              {dest.tags.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-3">
                    What to expect
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {dest.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-brand-paper border border-brand-accent/30 text-brand-primary text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {dest.image_credit?.name && (
                <p className="mt-10 text-xs text-brand-primary/50 flex items-center gap-1.5">
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
                      className="hover:text-brand-primary underline-offset-2 hover:underline"
                    >
                      {dest.image_credit.name}
                    </a>
                  ) : (
                    <span>{dest.image_credit.name}</span>
                  )}
                </p>
              )}

              {related.length > 0 && (
                <section className="mt-16 pt-10 border-t border-brand-primary/10">
                  <h2 className="font-bold text-brand-primary text-xl mb-6">
                    Other destinations in {dest.region}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {related.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/destinations/${r.slug}`}
                        className="group relative rounded-2xl overflow-hidden shadow-sm"
                      >
                        <div className="relative h-44">
                          {r.image_url && (
                            <Image
                              src={r.image_url}
                              alt={r.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="font-bold leading-tight">{r.name}</div>
                            {r.region && (
                              <div className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} />
                                {r.region}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="lg:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-brand-primary text-white p-5 rounded-2xl">
                  <h2 className="font-bold text-lg mb-2">Plan This Trip</h2>
                  <p className="text-white/60 text-sm mb-4">
                    Want a tailored itinerary for {dest.name}? Get in touch — we
                    plan trips across Pakistan.
                  </p>
                  <a
                    href={SITE.phoneLink}
                    className="flex items-center gap-2 bg-brand-accent text-brand-primary px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-accent/90 transition-all mb-2 w-full justify-center"
                  >
                    <Phone size={14} /> Call Us Now
                  </a>
                  <a
                    href={`mailto:${SITE.email}`}
                    className="flex items-center gap-2 border border-white/10 text-white/70 px-4 py-2.5 rounded-xl text-sm font-bold hover:border-brand-accent transition-all w-full justify-center"
                  >
                    <Mail size={14} /> Email Us
                  </a>
                </div>
                <div className="bg-brand-paper p-5 rounded-2xl border border-brand-accent/20">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-3">
                    Quick Facts
                  </h2>
                  <dl className="space-y-2 text-sm text-brand-primary/70">
                    <div className="flex justify-between gap-3">
                      <dt className="font-medium">Region</dt>
                      <dd className="text-right">{dest.region}</dd>
                    </div>
                    {dest.best_time && (
                      <div className="flex justify-between gap-3">
                        <dt className="font-medium">Best time</dt>
                        <dd className="text-right">{dest.best_time}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
