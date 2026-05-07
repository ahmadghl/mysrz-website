import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-utils';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Pakistan Destinations - Mountains, Cities & Culture',
  description:
    "Explore Pakistan's most stunning destinations - Hunza Valley, Skardu, Swat, Lahore, Karachi and more. Detailed guides for every traveller.",
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

interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  best_time: string;
  image_url: string;
  tags: string[];
  sort_order: number;
  image_credit_name?: string | null;
  image_credit_instagram?: string | null;
  image_credit_twitter?: string | null;
  image_credit_website?: string | null;
}

async function getDestinations(): Promise<Destination[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  try {
    const res = await fetch(
      `${url}/rest/v1/destinations?select=*&published=eq.true&order=sort_order.asc`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600, tags: ['destinations'] },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    // Resolve image URLs at fetch time — works for Google Drive and any other URL
    return data.map((d: Destination) => ({
      ...d,
      image_url: resolveImageUrl(d.image_url || '/images/placeholder.jpg'),
    }));
  } catch {
    return [];
  }
}

export default async function DestinationsPage() {
  const destinations = await getDestinations();

  return (
    <>
      <div className="bg-brand-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">Explore Pakistan</span>
          <h1 className="text-5xl font-bold mt-3 mb-4">All Destinations</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            From the world&apos;s highest mountain ranges to ancient civilizations - Pakistan is one of the most diverse travel destinations on Earth.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {destinations.length === 0 ? (
          <div className="text-center py-24 text-brand-primary/30">
            <MapPin size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Destinations coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => (
              <Link
                key={dest.slug}
                href={`/destinations/${dest.slug}`}
                className="group bg-brand-paper rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  {dest.image_url ? (
                    <Image
                      src={dest.image_url}
                      alt={dest.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center">
                      <MapPin size={32} className="text-brand-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {dest.best_time && (
                    <div className="absolute top-3 right-3 bg-brand-accent text-brand-primary text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
                      Best: {dest.best_time}
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1 text-white/80 text-xs">
                      <MapPin size={10} />{dest.region}
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-brand-primary mb-2">{dest.name}</h3>
                  <p className="text-brand-primary/50 text-sm leading-relaxed mb-3">{dest.description}</p>

                  {/* Image credit */}
                  {dest.image_credit_name && (
                    <p className="text-xs text-brand-primary/30 mb-3">
                      Photo: <span className="text-brand-primary/40 font-medium">{dest.image_credit_name}</span>
                      {dest.image_credit_instagram && (
                        <a href={`https://instagram.com/${dest.image_credit_instagram.replace('@', '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="ml-1 hover:underline" style={{ color: '#e1306c' }}>
                          Instagram
                        </a>
                      )}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(dest.tags ?? []).map((tag) => (
                      <span key={tag} className="bg-black/5 text-brand-primary/70 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
