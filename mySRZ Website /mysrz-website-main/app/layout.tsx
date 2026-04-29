import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Tracker } from '@/components/Tracker';
import { SITE } from '@/lib/utils';
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} - Explore Pakistan's Hidden Gems`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.founder }],
  generator: 'Next.js',
  keywords: [
    'Pakistan travel',
    'Pakistan tourism',
    'Hunza Valley',
    'K2 trek',
    'Lahore',
    'Karachi food',
    'Skardu',
    'Fairy Meadows',
    'Nanga Parbat',
    'Gilgit-Baltistan',
    'Pakistan travel guide',
    'mySRZ',
    'Ahmad Fraz',
  ],
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
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} - Explore Pakistan's Hidden Gems`,
    description: SITE.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mySRZ',
    title: `${SITE.name} - Explore Pakistan's Hidden Gems`,
    description: SITE.description,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  other: {
    'geo.region': 'PK',
    'geo.placename': 'Pakistan',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/logo.png`,
  description: SITE.description,
  foundingDate: '2021',
  founder: {
    '@type': 'Person',
    name: SITE.founder,
    email: SITE.email,
    telephone: SITE.phone,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: SITE.phone,
    contactType: 'customer support',
    availableLanguage: ['English', 'Urdu'],
    areaServed: 'PK',
  },
  sameAs: [SITE.social.instagram, SITE.social.twitter, SITE.social.facebook],
};

const travelAgencyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: SITE.name,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  address: { '@type': 'PostalAddress', addressCountry: 'PK' },
  areaServed: { '@type': 'Country', name: 'Pakistan' },
  priceRange: '$$',
  openingHours: 'Mo-Su 09:00-21:00',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE.url}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
