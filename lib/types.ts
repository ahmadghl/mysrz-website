export type Category = 'All' | 'Adventure' | 'Culture' | 'Food' | 'Nature';

export interface FaqItem {
  q: string;
  a: string;
}

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
  updated_at?: string | null;
  read_time: number;
  views: number;
  // SEO
  meta_title?: string | null;
  meta_description?: string | null;
  faqs?: FaqItem[];
  // Image credit (optional)
  image_credit_name?: string | null;
  image_credit_instagram?: string | null;
  image_credit_twitter?: string | null;
  image_credit_website?: string | null;
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
  updated_at?: string | null;
  // SEO
  meta_title?: string | null;
  meta_description?: string | null;
  faqs?: FaqItem[];
  image_credit?: {
    name?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}
