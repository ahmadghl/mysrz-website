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
          <div className="flex justify-between items-center h-20 py-3.5">
            <Link href="/" className="flex items-center" onClick={() => setOpen(false)} aria-label="mySRZ Travel & Tourism — home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mysrz-lockup.svg"
                alt="mySRZ Travel & Tourism"
                width={186}
                height={50}
                className="h-12 sm:h-14 w-auto"
              />
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
        <div className="md:hidden fixed top-20 left-0 right-0 z-40 bg-brand-paper border-b border-black/5 shadow-xl px-4 py-5 space-y-1">
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
