import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Eye, ChevronRight, User, Mountain, Camera, Utensils, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import type { Post, Category } from '@/lib/types';

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

export function PostCard({ post, showMeta = true, priority = false }: Props) {
  const Icon = CATEGORY_ICONS[post.category];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group bg-brand-paper rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-52 overflow-hidden">
        <Image
          src={post.image_url}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <span className="absolute top-3 left-3 bg-brand-paper/90 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-brand-primary/80 px-2 py-1 rounded-full flex items-center gap-1">
          <Icon size={12} /> {post.category}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        {showMeta && (
          <div className="flex items-center gap-3 text-xs text-brand-primary/40 mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={10} /> {format(new Date(post.created_at), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {post.read_time} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye size={10} /> {post.views.toLocaleString()}
            </span>
          </div>
        )}
        <h3 className="font-bold text-brand-primary leading-tight mb-2 text-lg group-hover:text-emerald-800 transition-colors">
          {post.title}
        </h3>
        <p className="text-brand-primary/50 text-sm line-clamp-2 leading-relaxed mb-4">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-brand-primary/40 flex items-center gap-1">
            <User size={10} /> {post.author}
          </span>
          <span className="text-xs font-bold text-brand-primary flex items-center gap-1 group-hover:gap-2 transition-all">
            Read <ChevronRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
