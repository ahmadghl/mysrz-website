import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowRight, User, Calendar, Clock, Eye, Phone, Mail,
} from 'lucide-react';
import { getPostBySlug, getRelatedPosts } from '@/lib/posts';
import { SharePost } from '@/components/SharePost';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SITE } from '@/lib/utils';

// Render dynamically so unknown slugs return a real 404 status code.
// Supabase fetches are still cached via the `posts` tag and invalidated
// by /api/revalidate when the admin publishes.
export const dynamic = 'force-dynamic';

function truncateDescription(input: string, max: number) {
  if (input.length <= max) return input;
  const cut = input.lastIndexOf(' ', max - 1);
  const idx = cut > max * 0.6 ? cut : max - 1;
  return `${input.slice(0, idx).trimEnd()}…`;
}

function wordCount(html: string) {
  return html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article not found' };
  return {
    title: post.title,
    description: truncateDescription(post.excerpt, 160),
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: [post.category, 'Pakistan travel', post.title],
    openGraph: {
      type: 'article',
      title: post.title,
      description: truncateDescription(post.excerpt, 160),
      url: `/blog/${post.slug}`,
      images: [{ url: post.image_url, width: 1200, height: 800, alt: post.title }],
      publishedTime: post.created_at,
      modifiedTime: post.created_at,
      authors: [post.author],
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: truncateDescription(post.excerpt, 160),
      images: [post.image_url],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, 4);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image_url,
    url: `${SITE.url}/blog/${post.slug}`,
    datePublished: post.created_at,
    dateModified: post.created_at,
    articleSection: post.category,
    wordCount: wordCount(post.content),
    timeRequired: `PT${post.read_time}M`,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${SITE.url}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/blog/${post.slug}` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title },
        ]}
        hideVisual
      />

      <article>
        <div className="relative h-[60vh] overflow-hidden">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-4xl mx-auto px-4 pb-12 w-full text-white">
              <Link
                href="/blog"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:gap-4 transition-all uppercase tracking-widest"
              >
                <ArrowRight className="rotate-180" size={16} /> All Articles
              </Link>
              <span className="bg-brand-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
                <span className="flex items-center gap-2"><User size={14} /> {post.author}</span>
                <span className="flex items-center gap-2"><Calendar size={14} /> {format(new Date(post.created_at), 'MMMM d, yyyy')}</span>
                <span className="flex items-center gap-2"><Clock size={14} /> {post.read_time} min read</span>
                <span className="flex items-center gap-2"><Eye size={14} /> {post.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-grow min-w-0">
              {/* post.content is Tiptap-authored HTML from the admin panel.
                  Tailwind Typography `prose` styles it. Sanitization is not
                  applied because only authenticated admins can write to
                  blog_posts; revisit if any untrusted source is ever added. */}
              <div
                className="prose prose-stone max-w-none prose-headings:text-brand-primary prose-a:text-brand-primary prose-strong:text-brand-primary"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <SharePost title={post.title} slug={post.slug} />

              {related.length > 0 && (
                <div className="mt-12">
                  <h3 className="font-bold text-brand-primary text-xl mb-6">More Articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {related.map((r) => (
                      <Link href={`/blog/${r.slug}`} key={r.id} className="flex gap-3 group">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={r.image_url}
                            alt={r.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">{r.category}</span>
                          <h4 className="text-sm font-semibold text-stone-800 group-hover:text-brand-primary transition-colors line-clamp-2 mt-0.5">{r.title}</h4>
                          <span className="text-xs text-brand-primary/40">{r.read_time} min read</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="lg:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-brand-primary text-white p-5 rounded-2xl">
                  <h4 className="font-bold text-lg mb-2">Plan This Trip</h4>
                  <p className="text-white/60 text-sm mb-4">Need help planning your visit? Contact us for personalized advice.</p>
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
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-3">Quick Contact</h4>
                  <div className="space-y-2 text-sm text-brand-primary/70">
                    <div className="flex items-center gap-2"><Phone size={13} className="text-brand-accent" /> {SITE.phoneDisplay}</div>
                    <div className="flex items-center gap-2"><Mail size={13} className="text-brand-accent" /> {SITE.email}</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
