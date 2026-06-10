import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera, Leaf, Mountain, Utensils } from 'lucide-react';
import type { Category, Post } from '@/lib/types';

const CATEGORY_ICONS: Record<Exclude<Category, 'All'>, typeof Mountain> = {
  Adventure: Mountain,
  Culture: Camera,
  Food: Utensils,
  Nature: Leaf,
};

interface Props {
  post: Post;
  showMeta?: boolean;
  priority?: boolean;
}

/**
 * Aureate-restyled journal card. 4:5 image plate, category eyebrow
 * with icon, Playfair headline, excerpt, view-narrative link.
 *
 * Preserves the existing `priority` prop so the first card in a
 * grid can hint LCP via next/image's fetchpriority=high. Sizes
 * unchanged.
 */
export function PostCard({ post, showMeta = true, priority = false }: Props) {
  const Icon = CATEGORY_ICONS[post.category];

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col border border-aureate-outline-variant bg-aureate-surface transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={post.image_url}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-grow flex-col p-8">
        <span className="mb-3 flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary">
          <Icon size={12} aria-hidden="true" /> {post.category}
        </span>
        <h3 className="mb-4 font-aureate-headline text-aureate-headline-md text-aureate-on-surface transition-colors duration-300 group-hover:text-aureate-primary">
          {post.title}
        </h3>
        <p className="mb-6 line-clamp-3 font-aureate-body text-aureate-body-md leading-relaxed text-aureate-on-surface-variant">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-aureate-outline-variant pt-5">
          {showMeta && (
            <span className="font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-on-surface-variant">
              {post.read_time} min read
            </span>
          )}
          <span className="inline-flex items-center gap-2 font-aureate-label text-aureate-label-md uppercase tracking-widest text-aureate-primary transition-colors group-hover:text-aureate-on-secondary-container">
            Read
            <ArrowRight
              size={12}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
