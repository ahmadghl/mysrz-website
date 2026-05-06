import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, ChevronDown, ChevronRight, Clock, Eye,
  MapPin, BookOpen, Users, Star, Phone,
} from 'lucide-react';
import { getAllPosts } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { SITE } from '@/lib/utils';

export const revalidate = 60;

interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  image_url: string;
  tags: string[];
}

async function getPreviewDestinations(): Promise<Destination[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/destinations?select=id,name,slug,region,image_url,tags&published=eq.true&order=sort_order.asc&limit=6`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        next: { revalidate: 3600, tags: ['destinations'] },
      }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getAllPosts();
  const heroPost = posts[2] ?? posts[0];
  const sidePosts = posts.slice(0, 2);
  const gridPosts = posts.slice(3, 6);
  const previewDestinations = await getPreviewDestinations();

  return (
    <>
      <section className="relative h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/seed/pakistan-mountains-hero/1920/1080"
            alt="Pakistan mountains"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/85 via-stone-900/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-brand-accent" />
              <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-semibold">Explore Pakistan</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.05]">
              Discover the<br />
              <span className="text-brand-accent">Soul of</span><br />
              Pakistan
            </h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              From the Karakoram peaks to ancient Mughal cities - your complete guide to Pakistan&apos;s most extraordinary destinations, food, and culture.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/destinations"
                className="bg-brand-primary text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-all shadow-lg">
                Explore Destinations
              </Link>
              <Link href="/blog"
                className="border border-white/30 text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-all">
                Read the Blog
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={28} className="text-white/40" />
        </div>
      </section>

      <section className="bg-brand-primary text-white py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '50+', label: 'Destinations Covered', icon: MapPin },
            { value: '100+', label: 'Travel Guides', icon: BookOpen },
            { value: '10K+', label: 'Monthly Readers', icon: Users },
            { value: '5★', label: 'Reader Rating', icon: Star },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon size={20} className="mx-auto mb-2 text-brand-accent/80" />
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-xs uppercase tracking-wider text-brand-accent/60 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-brand-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">Latest Stories</span>
              <h2 className="text-4xl font-bold text-brand-primary mt-2">Featured Articles</h2>
            </div>
            <Link href="/blog" className="mt-4 md:mt-0 flex items-center gap-2 text-sm font-semibold text-brand-primary hover:gap-4 transition-all">
              View All Articles <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            {heroPost && (
              <Link href={`/blog/${heroPost.slug}`} className="lg:col-span-3 group">
                <article className="relative h-80 lg:h-96 rounded-2xl overflow-hidden">
                  <Image src={heroPost.image_url} alt={heroPost.title} fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <span className="bg-brand-primary/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                      {heroPost.category}
                    </span>
                    <h3 className="text-2xl font-bold leading-tight mb-2">{heroPost.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-1"><Clock size={10} /> {heroPost.read_time} min read</span>
                      <span className="flex items-center gap-1"><Eye size={10} /> {heroPost.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            <div className="lg:col-span-2 flex flex-col gap-6">
              {sidePosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id} className="group flex gap-4 bg-brand-paper rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={post.image_url} alt={post.title} fill sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">{post.category}</span>
                    <h3 className="text-sm font-bold text-brand-primary leading-tight mt-1 line-clamp-2">{post.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-brand-primary/40 mt-2">
                      <span className="flex items-center gap-1"><Clock size={10} /> {post.read_time} min</span>
                      <span className="flex items-center gap-1"><Eye size={10} /> {post.views.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Destinations preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-primary">Where to Go</span>
            <h2 className="text-4xl font-bold text-brand-primary mt-2">Top Destinations</h2>
            <p className="text-brand-primary/50 mt-3 max-w-xl mx-auto">From northern peaks to ancient cities, Pakistan has something extraordinary for every kind of traveler.</p>
          </div>
          {previewDestinations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previewDestinations.map((dest) => (
                <Link key={dest.slug} href="/destinations" className="group relative rounded-2xl overflow-hidden shadow-sm">
                  <div className="relative h-44 md:h-56">
                    {dest.image_url ? (
                      <Image src={dest.image_url} alt={dest.name} fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-brand-primary/10 flex items-center justify-center">
                        <MapPin size={28} className="text-brand-primary/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-3 left-3">
                      {dest.tags?.[0] && (
                        <span className="bg-brand-accent text-brand-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          {dest.tags[0]}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="font-bold text-lg leading-tight">{dest.name}</div>
                      <div className="text-xs text-white/70 flex items-center gap-1 mt-0.5"><MapPin size={10} />{dest.region}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-brand-primary/30">
              <MapPin size={36} className="mx-auto mb-3 opacity-30" />
              <p>Destinations coming soon.</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link href="/destinations"
              className="inline-block bg-brand-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-brand-primary/90 transition-all">
              See All Destinations
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-primary text-white text-center px-4">
        <div className="max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-brand-accent font-bold">Get in Touch</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">Plan Your Pakistan Journey</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">Have questions about traveling in Pakistan? We&apos;re here to help you plan an unforgettable trip.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact"
              className="bg-brand-accent text-brand-primary px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-brand-accent/90 transition-all">
              Contact Us
            </Link>
            <a href={SITE.phoneLink}
              className="border border-stone-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm hover:border-brand-accent transition-all flex items-center gap-2">
              <Phone size={16} /> {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-green-600 text-white p-3.5 rounded-full shadow-xl hover:bg-green-700 transition-all hover:scale-110">
        <ChevronRight size={20} className="rotate-90 hidden" />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>
    </>
  );
}
