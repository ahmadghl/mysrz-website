import Link from 'next/link';
import { Instagram, Twitter, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import { SiteLogo } from './SiteLogo';
import { NewsletterForm } from './NewsletterForm';
import { SITE } from '@/lib/utils';

const SOCIALS = [
  { Icon: Instagram, href: SITE.social.instagram, name: 'Instagram' },
  { Icon: Twitter, href: SITE.social.twitter, name: 'Twitter' },
  { Icon: Facebook, href: SITE.social.facebook, name: 'Facebook' },
];

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Footer() {
  return (
    <footer className="text-white pt-16 pb-0" style={{ background: '#111' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
                <SiteLogo />
              </div>
              <div>
                <div className="text-xl font-bold text-brand-accent">mySRZ</div>
                <div className="text-[9px] uppercase tracking-widest text-white/50">Travel & Tourism</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Your ultimate guide to exploring Pakistan&apos;s breathtaking landscapes, rich culture, and incredible cuisine. Discover hidden gems from Karakoram to the Arabian Sea.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(({ Icon, href, name }) => (
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
                <a href={SITE.phoneLink} className="hover:text-brand-accent transition-colors" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-brand-accent flex-shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-brand-accent transition-colors break-all">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-accent flex-shrink-0 mt-0.5" />
                <span>Pakistan</span>
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
          <span style={{ color: '#1a1a1a', fontWeight: 700 }}>© 2026 mySRZ. All rights reserved.</span>
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
