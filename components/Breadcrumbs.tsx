import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { SITE } from '@/lib/utils';

export interface Crumb {
  /** Display label */
  label: string;
  /** Path on the site, e.g. `/blog` or `/blog/lahore-mughals-and-food`.
   *  Omit for the trailing crumb (current page). */
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  /** Hide the visible bar but still emit JSON-LD. */
  hideVisual?: boolean;
  /** Optional className for the visible nav. */
  className?: string;
}

/**
 * Visible breadcrumb trail + JSON-LD `BreadcrumbList`. Pass crumbs in
 * order from root to current. Example:
 *
 *   <Breadcrumbs items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Destinations', href: '/destinations' },
 *     { label: 'Hunza Valley' },
 *   ]} />
 *
 * Aureate-restyled: aureate tokens, tracked-uppercase Montserrat
 * labels. JSON-LD payload unchanged so existing rich-result
 * eligibility carries over.
 */
export function Breadcrumbs({ items, hideVisual, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${SITE.url}${crumb.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {!hideVisual && (
        <nav
          aria-label="Breadcrumb"
          className={
            className ??
            'mx-auto max-w-aureate-container px-aureate-mobile pt-6 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant md:px-aureate-desktop'
          }
        >
          <ol className="flex flex-wrap items-center gap-2">
            {items.map((crumb, i) => {
              const isLast = i === items.length - 1;
              return (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-aureate-primary"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? 'text-aureate-primary' : ''}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight
                      size={12}
                      className="opacity-60"
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
}
