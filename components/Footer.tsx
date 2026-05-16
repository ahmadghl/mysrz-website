import Link from 'next/link';
import { Instagram, Twitter, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';
import { getSiteSettings } from '@/lib/site-settings';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export async function Footer() {
  const settings = await getSiteSettings();

  const socials = [
    { Icon: Instagram, href: settings.instagram_url, name: 'Instagram' },
    { Icon: Twitter,   href: settings.twitter_url,   name: 'Twitter' },
    { Icon: Facebook,  href: settings.facebook_url,  name: 'Facebook' },
  ].filter((s) => Boolean(s.href));

  const year = new Date().getFullYear();
  const copyrightText = settings.footer_show_year
    ? `© ${year} ${settings.footer_copyright_holder}. All rights reserved.`
    : `© ${settings.footer_copyright_holder}. All rights reserved.`;

  return (
    <footer className="text-white pt-16 pb-0" style={{ background: '#111' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="mb-5">
              {/* Dark variant of the same lockup — saffron mark, light wordmark for the footer's near-black background. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mysrz-lockup-dark.svg"
                alt="mySRZ Travel & Tourism"
                width={186}
                height={50}
                className="h-14 w-auto"
              />
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {settings.footer_tagline}
            </p>
            <div className="flex gap-3">
              {socials.map(({ Icon, href, name }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-10 h-10 rounded-xl bg-brand-primary/80 flex items-center justify-center hover:bg-brand-primary transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#d4af37', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#d4af37', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '20px' }}>
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-brand-accent flex-shrink-0" />
                <a href={settings.phone_link} className="hover:text-brand-accent transition-colors" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {settings.phone_display}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand-accent flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-brand-accent transition-colors break-all">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-accent flex-shrink-0 mt-0.5" />
                <span>{settings.address_label}</span>
              </li>
            </ul>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div
          style={{ background: '#d4af37', margin: '0 -2rem', padding: '10px 2rem' }}
          className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs"
        >
          <span style={{ color: '#1a1a1a', fontWeight: 700 }}>{copyrightText}</span>
          <div className="flex gap-6" style={{ color: '#1a1a1a' }}>
            <Link href="/about" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-white transition-colors">Terms of Use</Link>
            <a href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
