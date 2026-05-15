import type { FaqItem } from '@/lib/types';

interface Props {
  faqs: FaqItem[];
  /** Optional heading. Defaults to "Frequently asked questions". */
  heading?: string;
  /** Heading level. Defaults to h2; bump to h3 inside an `<aside>` or
   *  similar nested context. */
  as?: 'h2' | 'h3';
}

/**
 * Visible FAQ block + FAQPage JSON-LD. Render at the bottom of long
 * posts / destination pages. Mirrors what's stored in
 * `blog_posts.faqs` / `destinations.faqs` (an array of `{q, a}`
 * objects). Empty arrays render nothing.
 *
 * Google's FAQPage rich-result snippet displays best with 3–5 Q&A,
 * each answer kept under ~60 words. The admin editor surfaces a
 * word counter; this component does not re-validate.
 */
export function FaqSection({ faqs, heading = 'Frequently asked questions', as = 'h2' }: Props) {
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  const HeadingTag = as;

  return (
    <section className="mt-16 pt-10 border-t border-brand-primary/10" aria-labelledby="faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeadingTag id="faq-heading" className="text-2xl font-bold text-brand-primary mb-6">
        {heading}
      </HeadingTag>
      <dl className="space-y-5">
        {faqs.map((f, i) => (
          <div key={i}>
            <dt className="text-base font-semibold text-brand-primary">{f.q}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-brand-primary/70">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
