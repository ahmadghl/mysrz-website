'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-brand-paper/90 backdrop-blur-md border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18 py-3">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
              aria-label="mySRZ Travel & Tourism — home"
            >
              {/* Saffron mountain mark (public/mysrz-mark.svg) — same
                  asset as the admin sidebar. Decorative; the
                  accessible name lives on the <Link> above. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mysrz-mark.svg"
                alt=""
                width={60}
                height={40}
                className="h-9 sm:h-10 w-auto"
              />
              <div className="flex flex-col leading-none">
                <span
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    color: 'var(--brand-primary, #1a1a1a)',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                  }}
                  className="text-brand-primary"
                >
                  mySRZ
                </span>
                <span className="mt-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-accent">
                  Travel · Tourism
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive(href)
                      ? 'bg-brand-paper text-brand-primary font-semibold'
                      : 'text-brand-primary/70 hover:text-brand-primary hover:bg-brand-paper'
                  )}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="ml-3 bg-brand-primary text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-accent/90 transition-all shadow-sm"
              >
                Plan a Trip
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-black/5"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="md:hidden fixed top-18 left-0 right-0 z-40 bg-brand-paper border-b border-black/5 shadow-xl px-4 py-5 space-y-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-brand-primary/80 hover:bg-brand-paper hover:text-brand-primary transition-all"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block w-full bg-brand-primary text-white py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-center"
            >
              Plan a Trip
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
