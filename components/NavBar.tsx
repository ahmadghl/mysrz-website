'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Journal', href: '/blog' },
  { label: 'About', href: '/about' },
];

/**
 * Aureate-redesign NavBar — sticky, glassmorphic, switches to a
 * tighter compact state past 50px scroll. Wordmark + lockup left,
 * 3 tracked-uppercase links centered, "Plan a Trip" CTA right.
 *
 * Path matching uses startsWith(href) so `/blog/foo` still
 * highlights the Journal link. The Home link from the old nav was
 * dropped — the lockup itself navigates home, which matches the
 * design and de-clutters the link bar.
 *
 * Preserves the existing /navbar-lockup.svg asset + the LCP hints
 * (fetchPriority="high", decoding="async") from the perf PR. The
 * declared aspect-ratio (1220×360) keeps CLS at zero.
 */
export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Compact-on-scroll: switch nav vertical padding once user has
  // scrolled past the hero edge. Throttled via passive listener so
  // this doesn't contribute to INP.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll(); // sync initial state on hard navigation
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-aureate-outline-variant transition-all duration-300',
          scrolled
            ? 'bg-aureate-surface/90 backdrop-blur-md shadow-sm'
            : 'bg-aureate-surface/70 backdrop-blur-md',
        )}
      >
        <nav
          className={cn(
            'mx-auto flex max-w-aureate-container items-center justify-between px-aureate-mobile transition-all duration-300 md:px-aureate-desktop',
            scrolled ? 'py-4' : 'py-6',
          )}
        >
          <Link
            href="/"
            className="flex items-center transition-opacity hover:opacity-80"
            onClick={() => setOpen(false)}
            aria-label="mySRZ Travel & Tourism — home"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/navbar-lockup.svg"
              alt="mySRZ Tourism"
              width={1220}
              height={360}
              className={cn(
                'w-auto transition-all duration-300',
                scrolled ? 'h-12 sm:h-14' : 'h-14 sm:h-16',
              )}
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group relative font-aureate-label text-aureate-label-md uppercase tracking-widest transition-colors duration-300',
                    active
                      ? 'text-aureate-secondary'
                      : 'text-aureate-on-surface-variant hover:text-aureate-secondary',
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-px bg-aureate-secondary transition-all duration-300',
                      active ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden bg-aureate-primary px-7 py-3 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-aureate-primary-container hover:shadow-lg active:translate-y-0 md:inline-flex"
            >
              Plan a Trip
            </Link>
            <button
              type="button"
              className="rounded p-2 text-aureate-on-surface-variant transition-colors hover:bg-aureate-surface-container hover:text-aureate-secondary md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-[80px] z-40 border-b border-aureate-outline-variant bg-aureate-surface px-aureate-mobile py-6 shadow-xl md:hidden"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block w-full px-4 py-3 font-aureate-label text-aureate-label-md uppercase tracking-widest transition-colors',
                    isActive(href)
                      ? 'bg-aureate-surface-container text-aureate-secondary'
                      : 'text-aureate-on-surface-variant hover:bg-aureate-surface-container hover:text-aureate-secondary',
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block w-full bg-aureate-primary px-4 py-3 text-center font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-primary"
              >
                Plan a Trip
              </Link>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
