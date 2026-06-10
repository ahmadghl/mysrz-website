'use client';

import { useEffect, useState } from 'react';

interface Props {
  title: string;
  slug: string;
}

/**
 * Aureate-restyled share strip. Underlined-uppercase links replace
 * the previous chunky buttons — fits the editorial register of a
 * blog post footer. URLs unchanged.
 */
export function SharePost({ title, slug }: Props) {
  const [origin, setOrigin] = useState('https://www.mysrztourism.com');
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/blog/${slug}`;
  const text = encodeURIComponent(`${title} - mySRZ`);
  const links = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Twitter / X',
      href: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="mt-12 border-t border-aureate-outline-variant pt-8">
      <p className="mb-4 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
        Share this article
      </p>
      <div className="flex flex-wrap gap-6">
        {links.map(({ name, href }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface underline decoration-aureate-outline-variant decoration-1 underline-offset-4 transition-all hover:decoration-aureate-primary"
          >
            {name}
          </a>
        ))}
      </div>
    </div>
  );
}
