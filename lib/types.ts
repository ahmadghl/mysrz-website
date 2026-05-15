export type Category = 'All' | 'Adventure' | 'Culture' | 'Food' | 'Nature';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: Exclude<Category, 'All'>;
  author: string;
  created_at: string;
  read_time: number;
  views: number;
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  region: string;
  description: string;
  best_time: string;
  image_url: string;
  tags: string[];
  sort_order: number;
  image_credit?: {
    name?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}
