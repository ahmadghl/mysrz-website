import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How mySRZ Travel & Tourism collects, uses and protects your information, including cookies and third-party advertising.',
  alternates: { canonical: '/privacy' },
};

const article =
  'prose prose-stone max-w-none prose-headings:font-aureate-headline prose-headings:text-aureate-on-surface prose-h2:text-aureate-headline-md prose-p:font-aureate-body prose-p:text-aureate-on-surface-variant prose-p:leading-relaxed prose-a:text-aureate-primary prose-li:text-aureate-on-surface-variant prose-li:font-aureate-body prose-strong:text-aureate-on-surface';

export default async function PrivacyPage() {
  const s = await getSiteSettings();
  const SITE = { name: s.site_name, url: s.site_url, email: s.email, founder: s.founder_name };
  return (
    <main className="mx-auto max-w-3xl px-aureate-mobile py-16 md:px-aureate-desktop md:py-24">
      <p className="mb-4 font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">Legal</p>
      <h1 className="mb-3 font-aureate-display text-aureate-display-lg-mobile italic leading-tight text-aureate-on-surface md:text-aureate-display-lg">
        Privacy Policy
      </h1>
      <p className="mb-10 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">Last updated: 13 June 2026</p>

      <article className={article}>
        <p>
          This Privacy Policy explains how {SITE.name} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), operated by {SITE.founder},
          collects, uses and protects information when you visit {SITE.url}. By using the site you agree to the practices described here.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li><strong>Analytics data.</strong> We run our own first-party analytics to understand how the site is used: pages viewed, referring source, device type, browser, language, and an approximate location (country and city) derived from your network. We do not store your IP address. A random session identifier is kept in your browser storage to group a single visit.</li>
          <li><strong>Information you provide.</strong> If you use our contact or enquiry form or subscribe to updates, we collect the details you submit, such as your name, email address and message.</li>
          <li><strong>Cookies and similar technologies.</strong> We and our partners use cookies and browser storage as described in the Cookies section below.</li>
        </ul>

        <h2>How we use your information</h2>
        <ul>
          <li>To operate, maintain and improve the website and its content.</li>
          <li>To respond to your enquiries and, where you have asked, to send you updates.</li>
          <li>To understand aggregate traffic and which travel guides are useful.</li>
          <li>To display advertising that helps support the site (see below).</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          Cookies are small files stored on your device. We use a small number of first-party items for basic functionality and analytics. Third parties, including advertising partners, may also set cookies as described next. You can control or delete cookies through your browser settings. For more detail see our <Link href="/cookies">Cookie Policy</Link>.
        </p>

        <h2>Advertising and Google AdSense</h2>
        <p>
          We use third-party advertising, including Google AdSense, to help support this website.
        </p>
        <ul>
          <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.</li>
          <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to this site and other sites on the internet.</li>
          <li>You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
          <li>You can also opt out of a third-party vendor&apos;s use of cookies for personalised advertising at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</li>
        </ul>

        <h2>Third-party services</h2>
        <p>
          We rely on trusted providers to run the site, including Google (advertising), and our hosting and database providers. These services process limited data on our behalf in order to deliver the website to you.
        </p>

        <h2>Data retention and security</h2>
        <p>
          We keep analytics and enquiry data only as long as needed for the purposes above, and we take reasonable measures to protect it. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.
        </p>

        <h2>Your rights</h2>
        <p>
          You may request access to, correction of, or deletion of the personal information you have given us by contacting us. To stop being counted in our own analytics on a device, you can also disable analytics for that device on request.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          The site is intended for a general audience and is not directed at children under 13. We do not knowingly collect personal information from children.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The latest version will always be posted on this page with a revised date.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. See also our <Link href="/terms">Terms of Service</Link>.
        </p>
      </article>
    </main>
  );
}
