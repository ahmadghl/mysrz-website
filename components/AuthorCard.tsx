import Link from 'next/link';
import { ExternalLink, Instagram, Mail } from 'lucide-react';
import { SITE } from '@/lib/utils';

interface Props {
  /** Author display name. Defaults to the site founder. */
  name?: string;
  /** Short bio sentence. Defaults to the founder's role line. */
  bio?: string;
  /** Author role/title, e.g. "Founder, mySRZ Tourism". */
  role?: string;
  /** Author photo URL. Falls back to initials avatar when null/empty. */
  imageUrl?: string | null;
}

/**
 * Footer card on blog post pages signalling author authority for
 * E-E-A-T. The Person JSON-LD lives on `/about` (single canonical
 * entity, referenced from `BlogPosting.author` via `@id`). This
 * card is the human-facing equivalent — a real named author with a
 * real bio (and photo when available) is the strongest E-E-A-T signal.
 */
export function AuthorCard({ name, bio, role, imageUrl }: Props = {}) {
  const displayName = name ?? SITE.founder;
  const displayBio =
    bio ??
    `Founder of ${SITE.name}. Has explored Pakistan first-hand since 2014, by local bus, motorbike and car.`;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <aside
      className="mt-16 border-t border-aureate-outline-variant pt-10"
      aria-label="About the author"
    >
      <div className="flex items-start gap-5 border-l-2 border-aureate-primary bg-aureate-surface-container-low p-8">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={displayName}
            width={56}
            height={56}
            loading="lazy"
            className="h-14 w-14 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-aureate-primary font-aureate-headline text-xl font-bold text-aureate-on-primary"
            aria-hidden="true"
          >
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="mb-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
            About the author
          </p>
          <Link
            href="/about"
            className="font-aureate-headline text-lg text-aureate-on-surface transition-colors hover:text-aureate-primary"
          >
            {displayName}
          </Link>
          {role && (
            <p className="mt-0.5 font-aureate-label text-aureate-label-md text-aureate-on-surface-variant">
              {role}
            </p>
          )}
          <p className="mt-3 font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
            {displayBio}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-1.5 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant transition-colors hover:text-aureate-primary"
            >
              <Mail size={12} aria-hidden="true" />
              Email
            </a>
            {SITE.social.instagram && (
              <a
                href={SITE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant transition-colors hover:text-aureate-primary"
              >
                <Instagram size={12} aria-hidden="true" />
                Instagram
              </a>
            )}
            <Link
              href="/about"
              className="ml-auto inline-flex items-center gap-1.5 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant transition-colors hover:text-aureate-primary"
            >
              Full bio <ExternalLink size={11} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
