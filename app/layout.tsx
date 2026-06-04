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
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
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

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
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
    sameAs: [settings.instagram_url, settings.twitter_url, settings.facebook_url].filter(Boolean),
  };

  const travelAgencyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: settings.site_name,
    url: settings.site_url,
    telephone: settings.phone,
    email: settings.email,
    address: { '@type': 'PostalAddress', addressCountry: 'PK' },
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    priceRange: '$$',
    openingHours: 'Mo-Su 09:00-21:00',
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
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
  };

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://n8n.mysrztourism.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(travelAgencyJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
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
