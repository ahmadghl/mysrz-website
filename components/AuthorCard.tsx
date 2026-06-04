import Link from 'next/link';
import { Mail, Instagram, ExternalLink } from 'lucide-react';
import { SITE } from '@/lib/utils';

interface Props {
  /** Author display name. Defaults to the site founder. */
  name?: string;
  /** Short bio sentence. Defaults to the founder's role line. */
  bio?: string;
}

/**
 * Footer card on blog post pages signalling author authority for
 * E-E-A-T. The Person JSON-LD lives on `/about` (single canonical
 * entity, referenced from `BlogPosting.author` via `@id`). This card
 * is the human-facing equivalent.
 */
export function AuthorCard({ name, bio }: Props = {}) {
  const displayName = name ?? SITE.founder;
  const displayBio =
    bio ??
    `Founder of ${SITE.name}. Pakistan travel writer with first-hand experience across every destination covered on this site.`;

  return (
    <aside
      className="mt-16 pt-10 border-t border-brand-primary/10"
      aria-label="About the author"
    >
      <div className="flex items-start gap-4 bg-brand-paper rounded-2xl p-6 border border-brand-accent/15">
        <div
          className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-brand-primary font-bold text-xl"
          style={{ background: 'rgba(217,162,39,0.18)' }}
          aria-hidden="true"
        >
          {displayName
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-widest font-bold text-brand-accent mb-1">
            About the author
          </p>
          <Link
            href="/about"
            className="text-lg font-bold text-brand-primary hover:underline underline-offset-4"
          >
            {displayName}
          </Link>
          <p className="mt-2 text-sm leading-relaxed text-brand-primary/70">{displayBio}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-1.5 text-brand-primary/60 hover:text-brand-primary transition-colors"
            >
              <Mail size={12} aria-hidden="true" />
              Email
            </a>
            {SITE.social.instagram && (
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-primary/60 hover:text-brand-primary transition-colors"
              >
                <Instagram size={12} aria-hidden="true" />
                Instagram
              </a>
            )}
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-brand-primary/60 hover:text-brand-primary transition-colors ml-auto"
            >
              Full bio <ExternalLink size={11} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
