'use client';

import { useEffect, useState } from 'react';

interface Props {
  title: string;
  slug: string;
}

export function SharePost({ title, slug }: Props) {
  const [origin, setOrigin] = useState('https://www.mysrztourism.com');
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/blog/${slug}`;
  const text = encodeURIComponent(`${title} - mySRZ`);
  const links = [
    { name: 'WhatsApp', color: 'bg-green-600', href: `https://wa.me/?text=${text}%20${encodeURIComponent(url)}` },
    { name: 'Facebook', color: 'bg-blue-600', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Twitter/X', color: 'bg-brand-primary', href: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}` },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-black/10">
      <h3 className="font-bold text-brand-primary mb-4">Share this article</h3>
      <div className="flex gap-3 flex-wrap">
        {links.map(({ name, color, href }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${color} text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all`}
          >
            {name}
          </a>
        ))}
      </div>
    </div>
  );
}
