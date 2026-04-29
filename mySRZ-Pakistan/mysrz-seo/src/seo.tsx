/**
 * SEO.tsx — Dynamic SEO manager
 * Updates document.title, meta tags, canonical URL, and og: tags
 * on every "page" and blog post change.
 * 
 * No extra library needed — uses native DOM APIs.
 */

const BASE_URL = 'https://www.mysrztourism.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  article?: {
    publishedTime: string;
    author: string;
    section: string;
  };
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: object) {
  let el = document.querySelector(`script[data-seo="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo', id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function applySEO(config: SEOConfig) {
  const { title, description, canonical, ogImage, ogType, keywords, article } = config;
  const image = ogImage || DEFAULT_IMAGE;
  const type = ogType || 'website';
  const fullCanonical = canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`;

  // Title
  document.title = title;

  // Primary
  setMeta('description', description);
  if (keywords) setMeta('keywords', keywords);
  setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

  // Canonical
  setLink('canonical', fullCanonical);

  // Open Graph
  setMeta('og:title', title, 'property');
  setMeta('og:description', description, 'property');
  setMeta('og:url', fullCanonical, 'property');
  setMeta('og:type', type, 'property');
  setMeta('og:image', image, 'property');
  setMeta('og:image:width', '1200', 'property');
  setMeta('og:image:height', '630', 'property');
  setMeta('og:locale', 'en_PK', 'property');
  setMeta('og:site_name', 'mySRZ Travel & Tourism', 'property');

  // Twitter
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', title);
  setMeta('twitter:description', description);
  setMeta('twitter:image', image);

  // Article tags (for blog posts)
  if (article) {
    setMeta('article:published_time', article.publishedTime, 'property');
    setMeta('article:author', article.author, 'property');
    setMeta('article:section', article.section, 'property');
  }

  // Update URL in browser (no page reload)
  if (window.location.href !== fullCanonical) {
    window.history.pushState({}, '', fullCanonical);
  }
}

// ── Per-page SEO configs ──────────────────────────────────────────────────────

export const PAGE_SEO: Record<string, SEOConfig> = {
  home: {
    title: "mySRZ Travel & Tourism — Explore Pakistan's Hidden Gems",
    description: "Your ultimate guide to Pakistan travel — K2 treks, Hunza Valley, Lahore food, Karachi street food, Mughal history & more. Expert guides by Ahmad Fraz.",
    canonical: '/',
    keywords: 'Pakistan travel, Pakistan tourism, Hunza Valley, K2 trek, Lahore, Skardu, Fairy Meadows, Gilgit-Baltistan, Pakistan travel guide',
  },
  destinations: {
    title: "Pakistan Destinations — Mountains, Cities & Culture | mySRZ Tourism",
    description: "Explore Pakistan's most stunning destinations — Hunza Valley, Skardu, Swat, Lahore, Karachi and more. Detailed guides for every traveller.",
    canonical: '/destinations',
    keywords: 'Pakistan destinations, Hunza Valley, Skardu, Swat Valley, Lahore, Karachi, Fairy Meadows, northern Pakistan',
  },
  blog: {
    title: "Pakistan Travel Blog — Tips, Guides & Stories | mySRZ Tourism",
    description: "Read in-depth Pakistan travel guides, destination stories, food discoveries and adventure tips written by local expert Ahmad Fraz.",
    canonical: '/blog',
    keywords: 'Pakistan travel blog, Pakistan travel guide, Hunza guide, Skardu guide, Pakistan adventure travel',
  },
  about: {
    title: "About mySRZ — Pakistan Travel Experts | Ahmad Fraz",
    description: "Learn about mySRZ Travel & Tourism — Pakistan's trusted travel guide founded by Ahmad Fraz. Our mission, team, and travel philosophy.",
    canonical: '/about',
  },
  contact: {
    title: "Contact mySRZ — Book a Pakistan Tour | mySRZ Tourism",
    description: "Get in touch with mySRZ Travel & Tourism to plan your Pakistan trip. Call +92-301-2432222 or send us a message. We reply within 24 hours.",
    canonical: '/contact',
    keywords: 'contact mySRZ, book Pakistan tour, Pakistan tour inquiry, Ahmad Fraz contact',
  },
};

// Blog post SEO — generated dynamically from post data
export function getBlogPostSEO(post: {
  title: string;
  excerpt: string;
  image_url: string;
  slug?: string;
  id: string;
  category: string;
  author: string;
  created_at: string;
}): SEOConfig {
  const slug = post.slug || post.id;
  return {
    title: `${post.title} | mySRZ Travel & Tourism`,
    description: post.excerpt.slice(0, 160),
    canonical: `/blog/${slug}`,
    ogImage: post.image_url,
    ogType: 'article',
    keywords: `${post.category}, Pakistan travel, ${post.title}`,
    article: {
      publishedTime: post.created_at,
      author: post.author,
      section: post.category,
    },
  };
}

// Blog post structured data (schema.org)
export function applyBlogPostSchema(post: {
  title: string;
  excerpt: string;
  image_url: string;
  slug?: string;
  id: string;
  author: string;
  created_at: string;
}) {
  const slug = post.slug || post.id;
  setJsonLd('blog-post', {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image_url,
    url: `${BASE_URL}/blog/${slug}`,
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: {
      '@type': 'Person',
      name: post.author,
      url: `${BASE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'mySRZ Travel & Tourism',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${slug}`,
    },
  });
}

// Remove blog post schema when navigating away
export function removeBlogPostSchema() {
  const el = document.querySelector('script[data-seo="blog-post"]');
  if (el) el.remove();
}
