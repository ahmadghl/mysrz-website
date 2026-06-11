import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowRight, Calendar, Clock, Eye, User } from 'lucide-react';
import { getAllPosts, getPostBySlug, getPostSlugs, getRelatedPosts } from '@/lib/posts';
import { SharePost } from '@/components/SharePost';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FaqSection } from '@/components/FaqSection';
import { AuthorCard } from '@/components/AuthorCard';
import { SITE } from '@/lib/utils';
import { RevealOnScroll } from '@/components/aureate/RevealOnScroll';

// Single canonical Person entity referenced from every BlogPosting's
// `author`. The Person itself lives on /about (Person JSON-LD on
// app/about/page.tsx).
const AUTHOR_ID = `${SITE.url}/about#ahmad-fraz`;

// ISR: cache rendered HTML at the edge. Admin publishes call
// /api/revalidate which fires revalidateTag('posts') + revalidatePath
// to purge instantly; the 60s window below is just a safety net in
// case the webhook ever fails. Known slugs are prerendered at build
// time via generateStaticParams; unknown slugs render on demand and
// notFound() still emits a real 404 status code under ISR.
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

function truncateDescription(input: string, max: number) {
  if (input.length <= max) return input;
  const cut = input.lastIndexOf(' ', max - 1);
  const idx = cut > max * 0.6 ? cut : max - 1;
  return `${input.slice(0, idx).trimEnd()}…`;
}

function wordCount(html: string) {
  return html.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
}

// Best-effort detection of HTML-shaped content. If false, we treat the
// content as plain text and wrap it in <p> tags inside prose.
function isHTML(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Article not found' };
  const seoTitle = post.meta_title || post.title;
  const seoDesc = truncateDescription(post.meta_description || post.excerpt, 160);
  return {
    title: seoTitle,
    description: seoDesc,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: [post.category, 'Pakistan travel', post.title],
    openGraph: {
      type: 'article',
      title: seoTitle,
      description: seoDesc,
      url: `/blog/${post.slug}`,
      images: [{ url: post.image_url, width: 1200, height: 800, alt: post.title }],
      publishedTime: post.created_at,
      modifiedTime: post.created_at,
      authors: [post.author],
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [post.image_url],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  // Parallelize the post lookup and the all-posts list (used for
  // related). Both share the data cache underneath, but Promise.all
  // hides the round-trip latency when caches are cold.
  const [post, allPosts] = await Promise.all([
    getPostBySlug(slug),
    getAllPosts(),
  ]);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, 3, allPosts);
  const contentIsHTML = isHTML(post.content);
  const heroImage = post.image_url;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image_url,
    url: `${SITE.url}/blog/${post.slug}`,
    datePublished: post.created_at,
    dateModified: post.updated_at ?? post.created_at,
    articleSection: post.category,
    wordCount: wordCount(post.content),
    timeRequired: `PT${post.read_time}M`,
    // Reference the canonical Person entity emitted on /about by @id
    // rather than inlining. Lets Google build a single connected
    // author entity across every post.
    author: { '@id': AUTHOR_ID },
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
          { label: 'Journal', href: '/blog' },
          { label: post.title },
        ]}
        hideVisual
      />

      <article>
        {/* ───── HERO ───── */}
        <header className="relative flex h-[70vh] items-center overflow-hidden">
          <Image
            src={heroImage}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-aureate-on-surface/40 via-aureate-on-surface/20 to-aureate-on-surface/70" />
          <div className="relative z-10 mx-auto w-full max-w-4xl px-aureate-mobile md:px-aureate-desktop">
            <RevealOnScroll>
              <Link
                href="/blog"
                className="mb-6 inline-flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary-fixed-dim transition-all hover:text-white"
              >
                <ArrowRight size={12} className="rotate-180" />
                All Stories
              </Link>
              <span className="mb-4 inline-block bg-white/10 px-3 py-1 font-aureate-label text-aureate-label-md uppercase tracking-widest text-white backdrop-blur-sm">
                {post.category}
              </span>
              <h1 className="mb-6 font-aureate-display text-aureate-headline-lg-mobile leading-tight text-white md:text-aureate-display-lg">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 font-aureate-label text-aureate-label-md uppercase tracking-widest text-white/80">
                <span className="flex items-center gap-2">
                  <User size={12} aria-hidden="true" /> {post.author}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar size={12} aria-hidden="true" />
                  <time dateTime={post.created_at}>
                    {format(new Date(post.created_at), 'MMM d, yyyy')}
                  </time>
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={12} aria-hidden="true" /> {post.read_time} min
                </span>
                <span className="flex items-center gap-2">
                  <Eye size={12} aria-hidden="true" />
                  {post.views.toLocaleString()}
                </span>
              </div>
            </RevealOnScroll>
          </div>

          {/* Image credit, overlaid bottom-right ON the photo (matching
              the homepage hero) so attribution reads as part of the
              image rather than orphaning a line into the article body.
              Links stay live here — unlike the homepage slideshow, this
              header is not aria-hidden. */}
          {post.image_credit_name && (
            <div className="absolute bottom-6 right-6 z-10 flex max-w-[16rem] flex-col items-end bg-aureate-on-surface/40 px-4 py-2 text-right backdrop-blur-sm">
              <span className="font-aureate-label text-[10px] uppercase leading-snug tracking-wider text-white/70">
                Photo by{' '}
                <span className="text-white/90">{post.image_credit_name}</span>
              </span>
              {(post.image_credit_instagram ||
                post.image_credit_twitter ||
                post.image_credit_website) && (
                <span className="mt-1 flex flex-wrap items-center justify-end gap-x-2 font-aureate-label text-[10px] uppercase tracking-wider text-white/60">
                  {post.image_credit_instagram && (
                    <a
                      href={`https://instagram.com/${post.image_credit_instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      Instagram
                    </a>
                  )}
                  {post.image_credit_twitter && (
                    <a
                      href={`https://twitter.com/${post.image_credit_twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      Twitter / X
                    </a>
                  )}
                  {post.image_credit_website && (
                    <a
                      href={
                        post.image_credit_website.startsWith('http')
                          ? post.image_credit_website
                          : `https://${post.image_credit_website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-white"
                    >
                      Website
                    </a>
                  )}
                </span>
              )}
            </div>
          )}
        </header>

        {/* ───── BODY ───── */}
        <div className="mx-auto max-w-3xl px-aureate-mobile py-16 md:px-aureate-desktop md:py-24">
          {/*
            post.content is Tiptap-authored HTML from the admin panel.
            Tailwind Typography `prose` styles it. Sanitization is not
            applied because only authenticated admins can write to
            blog_posts; revisit if any untrusted source is ever added.
            If content is not HTML (plain text fallback), wrap in <p>.

            We layer the prose plugin's defaults with explicit aureate
            overrides so headings use Playfair + the right tone, and
            body copy stays in Source Serif 4.
          */}
          {contentIsHTML ? (
            <div
              className="prose prose-stone max-w-none prose-headings:font-aureate-headline prose-headings:text-aureate-on-surface prose-h2:text-aureate-headline-md prose-p:font-aureate-body prose-p:text-aureate-body-md prose-p:text-aureate-on-surface-variant prose-a:text-aureate-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-aureate-on-surface [&>p:first-of-type]:text-aureate-body-lg [&>p:first-of-type]:font-medium [&>p:first-of-type]:leading-relaxed [&>p:first-of-type]:text-aureate-on-surface"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="prose prose-stone max-w-none">
              <p className="font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">
                {post.content}
              </p>
            </div>
          )}

          {post.updated_at &&
            post.updated_at !== post.created_at &&
            new Date(post.updated_at).getTime() -
              new Date(post.created_at).getTime() >
              86_400_000 && (
              <p className="mt-8 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant/70">
                Last updated{' '}
                <time dateTime={post.updated_at}>
                  {format(new Date(post.updated_at), 'MMM d, yyyy')}
                </time>
              </p>
            )}

          <SharePost title={post.title} slug={post.slug} />
          <FaqSection faqs={post.faqs ?? []} />
          <AuthorCard name={post.author} />
        </div>

        {/* ───── RELATED ───── */}
        {related.length > 0 && (
          <section className="bg-aureate-surface-container-low py-20">
            <RevealOnScroll className="mx-auto max-w-aureate-container px-aureate-mobile md:px-aureate-desktop">
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <span className="mb-2 block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                    Continue Reading
                  </span>
                  <h2 className="font-aureate-headline text-aureate-headline-md text-aureate-on-surface">
                    More from the Journal
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="group hidden items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary md:inline-flex"
                >
                  All Stories
                  <ArrowRight
                    size={12}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-aureate-gutter md:grid-cols-3">
                {related.map((r, i) => (
                  <RevealOnScroll key={r.id} delay={i * 100}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="group block border border-aureate-outline-variant bg-aureate-surface transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Image
                          src={r.image_url}
                          alt={r.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-6">
                        <span className="mb-2 block font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
                          {r.category}
                        </span>
                        <h3 className="font-aureate-headline text-xl text-aureate-on-surface transition-colors duration-300 group-hover:text-aureate-primary">
                          {r.title}
                        </h3>
                      </div>
                    </Link>
                  </RevealOnScroll>
                ))}
              </div>
            </RevealOnScroll>
          </section>
        )}
      </article>
    </>
  );
}
