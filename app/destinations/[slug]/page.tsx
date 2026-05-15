import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Calendar, ArrowRight, Phone, Mail } from 'lucide-react';
import { getAllPosts } from '@/lib/posts';
import { SITE } from '@/lib/utils';
import { resolveImageUrl } from '@/lib/image-utils';

export const revalidate = 3600;

interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  best_time: string;
  image_url: string;
  tags: string[];
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
    return data.map((d: Destination) => ({
      ...d,
      image_url: resolveImageUrl(d.image_url || '/images/placeholder.jpg'),
    }));
  } catch { return []; }
}

export async function generateStaticParams() {
  const dests = await getDestinations();
  return dests.map((d) => ({ slug: d.slug }));
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dests = await getDestinations();
  const dest = dests.find((d) => d.slug === slug);
  if (!dest) return { title: 'Destination not found' };
  return {
    title: `${dest.name} Travel Guide — Pakistan | ${SITE.name}`,
    description: `Everything you need to visit ${dest.name}, ${dest.region}. Best time: ${dest.best_time}. ${dest.description}`.slice(0, 160),
    alternates: { canonical: `/destinations/${dest.slug}` },
    keywords: [dest.name, dest.region, 'Pakistan travel', ...dest.tags],
    openGraph: {
      title: `${dest.name} Travel Guide`,
      description: dest.description,
      url: `/destinations/${dest.slug}`,
      images: [{ url: resolveImageUrl(dest.image_url), width: 1200, height: 800, alt: dest.name }],
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params;
  const [dests, allPosts] = await Promise.all([getDestinations(), getAllPosts()]);
  const dest = dests.find((d) => d.slug === slug);
  if (!dest) notFound();

  const relatedPosts = allPosts
    .filter((p) =>
      p.title.toLowerCase().includes(dest.name.toLowerCase().split(' ')[0]) ||
      dest.tags.some((t) => p.category.toLowerCase().includes(t.toLowerCase()))
    )
    .slice(0, 3);

  const heroImage = dest.image_url; // already resolved at fetch time

  const destinationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: dest.name,
    description: dest.description,
    url: `${SITE.url}/destinations/${dest.slug}`,
    touristType: dest.tags,
    includesAttraction: { '@type': 'TouristAttraction', name: dest.name },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${SITE.url}/destinations` },
      { '@type': 'ListItem', position: 3, name: dest.name, item: `${SITE.url}/destinations/${dest.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <div className="relative h-[55vh] overflow-hidden">
        <Image src={heroImage} alt={dest.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto px-4 pb-12 w-full text-white">
            <Link href="/destinations"
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:gap-4 transition-all uppercase tracking-widest">
              <ArrowRight className="rotate-180" size={16} /> All Destinations
            </Link>
            <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
              <MapPin size={14} /> {dest.region}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">{dest.name}</h1>
            <span className="inline-flex items-center gap-1.5 bg-brand-accent text-brand-primary text-xs font-bold px-3 py-1.5 rounded-full">
              <Calendar size={12} /> Best time: {dest.best_time}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14">

        {/* Image credit */}
        {dest.image_credit_name && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-brand-primary/40">
            <span>Photo by</span>
            <span className="font-semibold text-brand-primary/60">{dest.image_credit_name}</span>
            {dest.image_credit_instagram && (
              <a href={`https://instagram.com/${dest.image_credit_instagram.replace('@', '')}`}
                target="_blank" rel="noopener noreferrer"
                className="font-semibold hover:underline" style={{ color: '#e1306c' }}>
                Instagram
              </a>
            )}
            {dest.image_credit_twitter && (
              <a href={`https://twitter.com/${dest.image_credit_twitter.replace('@', '')}`}
                target="_blank" rel="noopener noreferrer"
                className="font-semibold hover:underline" style={{ color: '#1da1f2' }}>
                Twitter/X
              </a>
            )}
            {dest.image_credit_website && (
              <a href={dest.image_credit_website.startsWith('http') ? dest.image_credit_website : `https://${dest.image_credit_website}`}
                target="_blank" rel="noopener noreferrer"
                className="font-semibold text-brand-primary/50 hover:underline">
                Website
              </a>
            )}
          </div>
        )}

        {/* Overview */}
        <p className="text-xl text-brand-primary/70 leading-relaxed mb-8">{dest.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-14">
          {dest.tags.map((tag) => (
            <span key={tag}
              className="bg-black/5 text-brand-primary/70 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-brand-primary mb-6">
              Travel guides for {dest.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id} className="group">
                  <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      sizes="300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                    {post.category}
                  </span>
                  <h3 className="text-sm font-semibold text-brand-primary group-hover:text-brand-accent transition-colors mt-1 line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-brand-primary text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Planning a trip to {dest.name}?</h2>
          <p className="text-white/60 mb-6">
            Get personalised advice from our Pakistan travel experts.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact"
              className="inline-block bg-brand-accent text-brand-primary font-bold px-6 py-3 rounded-xl hover:bg-brand-accent/90 transition-all">
              Contact Us
            </Link>
            <a href={SITE.phoneLink}
              className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-6 py-3 rounded-xl hover:border-brand-accent transition-all">
              <Phone size={14} /> {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
