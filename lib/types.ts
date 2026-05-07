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
  // SEO
  meta_title?: string | null;
  meta_description?: string | null;
  // Image credit (optional)
  image_credit_name?: string | null;
  image_credit_instagram?: string | null;
  image_credit_twitter?: string | null;
  image_credit_website?: string | null;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  best_time: string;
  image_url: string;
  tags: string[];
  published: boolean;
  sort_order: number;
  image_credit_name?: string | null;
  image_credit_instagram?: string | null;
  image_credit_twitter?: string | null;
  image_credit_website?: string | null;
}
