import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getAllDestinations } from '@/lib/destinations';
import { Breadcrumbs } from '@/components/Breadcrumbs';

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

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Destinations' },
        ]}
        hideVisual
      />
      <div className="bg-brand-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">
            Explore Pakistan
          </span>
          <h1 className="text-5xl font-bold mt-3 mb-4">All Destinations</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            From the world&apos;s highest mountain ranges to ancient
            civilizations — Pakistan is one of the most diverse travel
            destinations on Earth.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {destinations.length === 0 ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-brand-primary mb-3">
              Destination guides are on the way
            </h2>
            <p className="text-brand-primary/60 max-w-md mx-auto">
              We&apos;re writing detailed guides for every corner of Pakistan.
              Check back soon, or read our latest travel articles on the blog.
            </p>
            <Link
              href="/blog"
              className="inline-block mt-6 bg-brand-accent text-brand-primary font-semibold px-6 py-3 rounded-full text-sm uppercase tracking-wider"
            >
              Read the Blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.slug}`}
                className="group bg-brand-paper rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden bg-brand-primary">
                  {dest.image_url ? (
                    <Image
                      src={dest.image_url}
                      alt={dest.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(at 30% 20%, rgba(217,162,39,0.3), transparent 55%), #15301F',
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {dest.best_time && (
                    <div className="absolute top-3 right-3 bg-brand-accent text-brand-primary text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      Best: {dest.best_time}
                    </div>
                  )}
                  {dest.region && (
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-1 text-white/80 text-xs">
                        <MapPin size={10} />
                        {dest.region}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-brand-primary mb-2">
                    {dest.name}
                  </h3>
                  <p className="text-brand-primary/50 text-sm leading-relaxed mb-4">
                    {dest.description}
                  </p>
                  {dest.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {dest.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-black/5 text-brand-primary/70 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
