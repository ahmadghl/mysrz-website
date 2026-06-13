import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';
import { getSiteSettings } from '@/lib/site-settings';

const QUICK_LINKS = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Journal', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Aureate-redesign Footer — deep-green canvas, antique-gold
 * accents, cream copy. Mirrors the editorial-publication footers
 * used by heritage travel brands.
 *
 * Layout: 4-column grid (logo+tagline, Explore, Contact,
 * Newsletter). Preserves every data wiring from the previous
 * footer — getSiteSettings() drives tagline, social URLs,
 * phone/email/address, and copyright string. NewsletterForm is
 * unchanged (same /api/newsletter POST flow).
 *
 * Async server component, so it joins the React.cache() dedup pool
 * for getSiteSettings (no extra fetch per request beyond what the
 * layout already pays for).
 */
export async function Footer() {
  const settings = await getSiteSettings();

  const socials = [
    { Icon: Instagram, href: settings.instagram_url, name: 'Instagram' },
    { Icon: Twitter, href: settings.twitter_url, name: 'Twitter' },
    { Icon: Facebook, href: settings.facebook_url, name: 'Facebook' },
  ].filter((s) => Boolean(s.href));

  const year = new Date().getFullYear();
  const copyrightText = settings.footer_show_year
    ? `© ${year} ${settings.footer_copyright_holder}. All rights reserved.`
    : `© ${settings.footer_copyright_holder}. All rights reserved.`;

  return (
    <footer className="mt-20 w-full border-t border-aureate-outline-variant/30 bg-aureate-secondary text-white">
      <div className="mx-auto grid max-w-aureate-container grid-cols-1 gap-aureate-gutter px-aureate-mobile py-16 md:grid-cols-4 md:px-aureate-desktop md:py-20">
        {/* Lockup + tagline + social. Lockup is the dark variant so
            the wordmark + TOURISM ink reads in cream against the
            deep-green field. */}
        <div className="space-y-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/navbar-lockup-dark.svg"
            alt="mySRZ Tourism"
            width={1220}
            height={360}
            className="h-16 w-auto"
            loading="lazy"
            decoding="async"
          />
          <p className="font-aureate-body text-aureate-body-md leading-relaxed text-white/80">
            {settings.footer_tagline}
          </p>
          {socials.length > 0 && (
            <div className="flex gap-3 pt-2">
              {socials.map(({ Icon, href, name }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center border border-white/20 text-white/80 transition-all hover:border-aureate-primary-fixed-dim hover:bg-white/10 hover:text-aureate-primary-fixed-dim"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Explore column */}
        <div className="flex flex-col gap-4">
          <h4 className="mb-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary-fixed-dim">
            Explore
          </h4>
          {QUICK_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="inline-block font-aureate-body text-aureate-body-md text-white/80 transition-all duration-300 hover:translate-x-1 hover:text-aureate-primary-fixed-dim"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Contact column */}
        <div className="flex flex-col gap-4">
          <h4 className="mb-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary-fixed-dim">
            Contact
          </h4>
          <a
            href={settings.phone_link}
            className="inline-flex items-center gap-2 font-aureate-body text-aureate-body-md text-white/80 transition-colors hover:text-aureate-primary-fixed-dim"
          >
            <Phone size={14} aria-hidden="true" />
            {settings.phone_display}
          </a>
          <a
            href={`mailto:${settings.email}`}
            className="inline-flex items-center gap-2 break-all font-aureate-body text-aureate-body-md text-white/80 transition-colors hover:text-aureate-primary-fixed-dim"
          >
            <Mail size={14} aria-hidden="true" />
            {settings.email}
          </a>
          <p className="inline-flex items-start gap-2 font-aureate-body text-aureate-body-md text-white/80">
            <MapPin size={14} aria-hidden="true" className="mt-1 flex-shrink-0" />
            {settings.address_label}
          </p>
        </div>

        {/* Newsletter column — keeps the existing NewsletterForm
            untouched (same /api/newsletter POST behavior). */}
        <div className="flex flex-col gap-4">
          <h4 className="mb-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary-fixed-dim">
            Newsletter
          </h4>
          <p className="font-aureate-body text-aureate-body-md text-white/80">
            Monthly dispatches from across Pakistan — destinations, guides, and
            stories.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-aureate-container flex-col items-center justify-between gap-3 px-aureate-mobile py-6 md:flex-row md:px-aureate-desktop">
          <p className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-white/60">
            {copyrightText}
          </p>
          <div className="flex gap-8">
            <Link
              href="/privacy"
              className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-white/60 transition-colors hover:text-aureate-primary-fixed-dim"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-white/60 transition-colors hover:text-aureate-primary-fixed-dim"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-white/60 transition-colors hover:text-aureate-primary-fixed-dim"
            >
              Cookies
            </Link>
            <a
              href="/sitemap.xml"
              className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-white/60 transition-colors hover:text-aureate-primary-fixed-dim"
            >
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
