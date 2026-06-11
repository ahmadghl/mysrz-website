import type { Metadata, Viewport } from 'next';
import { Montserrat, Playfair_Display, Source_Serif_4 } from 'next/font/google';
import { Suspense } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Tracker } from '@/components/Tracker';
import { Analytics } from '@/components/Analytics';
import { getSiteSettings } from '@/lib/site-settings';
import './globals.css';

// Inter was dropped in Phase 5 — every page is now on the Aureate
// typography stack (Playfair / Source Serif 4 / Montserrat). The
// fallback chain for Montserrat steps straight to system-ui which is
// fine for the brief FOUT window before the variable font arrives.

const playfair = Playfair_Display({
  subsets: ['latin'],
  // Restrict to the weights actually used by the Aureate design:
  // 600 (headlines) and 700 (display headlines + blog body h2/h3).
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
  // Aureate uses Playfair as the display + headline font on every
  // rebuilt page (nav, hero, section titles), so preload is back on.
  // The blog-body markdown headings also use it.
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  // 400 = body copy; 400-italic = decorative quotes/taglines; 600 =
  // emphasis. These cover every Source Serif 4 usage in the design.
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif-4',
  display: 'swap',
  // Body font for the Aureate redesign — preload on every page so
  // first paint doesn't FOUT into Georgia/system serif first.
});

const montserrat = Montserrat({
  subsets: ['latin'],
  // 500 (nav links, footer copy) + 600 (button labels, tracking
  // labels). Two weights only; everything else in the design uses
  // Playfair or Source Serif 4.
  weight: ['500', '600'],
  variable: '--font-montserrat',
  display: 'swap',
  // Above-the-fold (nav labels) — preload.
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
    // Set GSC_SITE_VERIFICATION in Vercel to verify Google Search
    // Console via the HTML-tag method. Emits nothing until set, so it
    // is safe to ship inert. GSC is the source of the query/CTR data
    // that drives the content roadmap in SEO-STRATEGY.md (Phase 3).
    verification: {
      google: process.env.GSC_SITE_VERIFICATION || undefined,
    },
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
  // Cream — matches Aureate `background` token. Affects mobile
  // browser chrome (Safari address bar, PWA splash, etc.).
  themeColor: '#fdf9e9',
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
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSerif.variable} ${montserrat.variable}`}
    >
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
      <body className="flex min-h-screen flex-col bg-aureate-background font-aureate-body text-aureate-on-surface">
        <NavBar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <Tracker />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
