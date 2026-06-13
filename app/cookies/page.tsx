import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How mySRZ Travel & Tourism uses cookies and browser storage, including for analytics and advertising.',
  alternates: { canonical: '/cookies' },
};

const article =
  'prose prose-stone max-w-none prose-headings:font-aureate-headline prose-headings:text-aureate-on-surface prose-h2:text-aureate-headline-md prose-p:font-aureate-body prose-p:text-aureate-on-surface-variant prose-p:leading-relaxed prose-a:text-aureate-primary prose-li:text-aureate-on-surface-variant prose-li:font-aureate-body prose-strong:text-aureate-on-surface';

export default async function CookiePage() {
  const s = await getSiteSettings();
  const SITE = { name: s.site_name, url: s.site_url, email: s.email, founder: s.founder_name };
  return (
    <main className="mx-auto max-w-3xl px-aureate-mobile py-16 md:px-aureate-desktop md:py-24">
      <p className="mb-4 font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">Legal</p>
      <h1 className="mb-3 font-aureate-display text-aureate-display-lg-mobile italic leading-tight text-aureate-on-surface md:text-aureate-display-lg">
        Cookie Policy
      </h1>
      <p className="mb-10 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">Last updated: 13 June 2026</p>

      <article className={article}>
        <p>
          Cookies are small text files, and similar browser storage, that a website saves on your device. This page explains how {SITE.name} uses them. For the wider picture see our <Link href="/privacy">Privacy Policy</Link>.
        </p>

        <h2>Types of cookies we use</h2>
        <ul>
          <li><strong>Essential and functional.</strong> A small amount of browser storage is used to make the site work and to remember basic preferences.</li>
          <li><strong>Analytics.</strong> Our own first-party analytics keep a random session identifier and a returning-visitor flag in your browser so we can measure how the site is used. This data is aggregated and does not store your IP address.</li>
          <li><strong>Advertising.</strong> Third-party partners, including Google AdSense, set cookies to serve and measure ads, including ads based on your prior visits to this and other websites.</li>
        </ul>

        <h2>Managing cookies</h2>
        <p>
          You can block or delete cookies through your browser settings at any time. Doing so may affect how some parts of the site work.
        </p>
        <ul>
          <li>Manage personalised ads from Google at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
          <li>Opt out of personalised advertising from many vendors at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a> and <a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer">youronlinechoices.eu</a>.</li>
        </ul>

        <h2>Changes</h2>
        <p>
          We may update this Cookie Policy as our use of cookies changes. The latest version will always be posted here.
        </p>

        <h2>Contact</h2>
        <p>
          Questions can be sent to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
      </article>
    </main>
  );
}
