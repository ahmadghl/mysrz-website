import type { Metadata } from 'next';
import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of the mySRZ Travel & Tourism website and its content.',
  alternates: { canonical: '/terms' },
};

const article =
  'prose prose-stone max-w-none prose-headings:font-aureate-headline prose-headings:text-aureate-on-surface prose-h2:text-aureate-headline-md prose-p:font-aureate-body prose-p:text-aureate-on-surface-variant prose-p:leading-relaxed prose-a:text-aureate-primary prose-li:text-aureate-on-surface-variant prose-li:font-aureate-body prose-strong:text-aureate-on-surface';

export default async function TermsPage() {
  const s = await getSiteSettings();
  const SITE = { name: s.site_name, url: s.site_url, email: s.email, founder: s.founder_name };
  return (
    <main className="mx-auto max-w-3xl px-aureate-mobile py-16 md:px-aureate-desktop md:py-24">
      <p className="mb-4 font-aureate-label text-aureate-label-md uppercase tracking-[0.3em] text-aureate-primary">Legal</p>
      <h1 className="mb-3 font-aureate-display text-aureate-display-lg-mobile italic leading-tight text-aureate-on-surface md:text-aureate-display-lg">
        Terms of Service
      </h1>
      <p className="mb-10 font-aureate-body text-aureate-body-md text-aureate-on-surface-variant">Last updated: 13 June 2026</p>

      <article className={article}>
        <p>
          These terms govern your use of {SITE.url}, operated by {SITE.name} ({SITE.founder}). By accessing or using the site, you agree to these terms. If you do not agree, please do not use the site.
        </p>

        <h2>Use of the site</h2>
        <p>
          You may use the site for personal, non-commercial travel research. You agree not to misuse the site, attempt to disrupt it, or use automated means to scrape its content without permission.
        </p>

        <h2>Travel information and accuracy</h2>
        <p>
          Our guides are provided for general information only. Travel details such as prices, routes, road and weather conditions, opening times and permit rules change frequently and can vary in practice. We make a genuine effort to keep information accurate and current, but we do not warrant that it is complete, error-free or up to date. Always verify critical details with official sources before you travel.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The text and original material on this site are owned by {SITE.name} and may not be copied or republished without permission. Some photographs are used under their respective licences (for example Creative Commons) and remain the property of their photographers, with attribution shown where required.
        </p>

        <h2>Enquiries and bookings</h2>
        <p>
          Where you contact us with a travel enquiry, any arrangement is subject to separate confirmation and terms agreed at that time. Submitting an enquiry does not create a binding booking.
        </p>

        <h2>External links and advertising</h2>
        <p>
          The site may contain links to third-party websites and may display third-party advertising. We are not responsible for the content, products or practices of external sites. Following any external link is at your own risk.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {SITE.name} is not liable for any loss or damage arising from your use of the site or reliance on its content. The site is provided on an &quot;as is&quot; basis without warranties of any kind.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the site after changes are posted means you accept the revised terms.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of Pakistan.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms can be sent to <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. See also our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </article>
    </main>
  );
}
