import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Tracker } from '@/components/Tracker';
import { getSiteSettings } from '@/lib/site-settings';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  // Default `preload: true` is correct — Inter is the body font on
  // every page, so we want the browser to fetch it eagerly.
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  // Only used in `.markdown-body h1/h2/h3` (blog post content). The
  // Tailwind `font-serif` token has zero usages elsewhere. Preloading
  // would burn ~48 KB of font bytes on every non-blog page where
  // Playfair never paints. The browser fetches it lazily when the
  // markdown-body selector first matches on /blog/[slug], and
  // display:swap masks the brief FOUT during that one swap.
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const titleDefault = `${settings.site_name} - Explore Pakistan's Hidden Gems`;
  const ogImage = settings.default_og_image_url || '/og-image.jpg';
  return {
    metadataBase: new URL(settings.site_url || 'https://www.mysrztourism.com'),
    title: {
      default: titleDefault,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.site_description,
    applicationName: settings.site_name,
    authors: [{ name: settings.founder_name }],
    generator: 'Next.js',
    keywords: settings.seo_keywords.length > 0 ? settings.seo_keywords : undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'en_PK',
      siteName: settings.site_name,
      url: settings.site_url,
      title: titleDefault,
      description: settings.site_description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: settings.site_name }],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@mySRZ',
      title: titleDefault,
      description: settings.site_description,
      images: [ogImage],
    },
    // Favicon + Apple touch icon are provided via the Next.js file
    // convention (app/icon.svg + app/apple-icon.svg). No explicit
    // `icons` block needed — the prior values pointed at files that
    // didn't exist in /public, producing 404s and the generic browser
    // globe in the tab.
    other: {
      'geo.region': 'PK',
      'geo.placename': 'Pakistan',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  // Consolidated JSON-LD graph for the site itself. Three site-wide
  // entities (Organization, TravelAgency, WebSite) share one
  // <script> tag via @graph instead of emitting three separate
  // blocks per page. Page-specific schema (BlogPosting, Person,
  // TouristAttraction, etc.) is still emitted from individual route
  // files so each surface ships only what it needs.
  const siteGraphJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${settings.site_url}#organization`,
        name: settings.site_name,
        url: settings.site_url,
        logo: `${settings.site_url}/logo.png`,
        description: settings.site_description,
        foundingDate: '2021',
        founder: {
          '@type': 'Person',
          name: settings.founder_name,
          email: settings.email,
          telephone: settings.phone,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: settings.phone,
          contactType: 'customer support',
          availableLanguage: ['English', 'Urdu'],
          areaServed: 'PK',
        },
        sameAs: [
          settings.instagram_url,
          settings.twitter_url,
          settings.facebook_url,
        ].filter(Boolean),
      },
      {
        '@type': 'TravelAgency',
        '@id': `${settings.site_url}#travel-agency`,
        name: settings.site_name,
        url: settings.site_url,
        telephone: settings.phone,
        email: settings.email,
        address: { '@type': 'PostalAddress', addressCountry: 'PK' },
        areaServed: { '@type': 'Country', name: 'Pakistan' },
        priceRange: '$$',
        openingHours: 'Mo-Su 09:00-21:00',
      },
      {
        '@type': 'WebSite',
        '@id': `${settings.site_url}#website`,
        name: settings.site_name,
        url: settings.site_url,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${settings.site_url}/blog?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Dropped two dns-prefetch hints (picsum.photos +
            n8n.mysrztourism.com). Neither was used by direct browser
            requests — picsum is proxied through /_next/image
            (same-origin), and the newsletter/contact forms POST to
            /api/* route handlers which call n8n server-side. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraphJsonLd) }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-brand-paper">
        <NavBar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
      </body>
    </html>
  );
}
