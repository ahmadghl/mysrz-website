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
            'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 text-sm text-brand-primary/60'
          }
        >
          <ol className="flex flex-wrap items-center gap-1">
            {items.map((crumb, i) => {
              const isLast = i === items.length - 1;
              return (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-brand-primary underline-offset-2 hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? 'text-brand-primary font-medium' : ''}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight
                      size={13}
                      className="opacity-50"
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
