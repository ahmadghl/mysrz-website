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
  name: string;
  slug: string;
  region: string;
  desc: string;
  best: string;
  image: string;
  tags: string[];
}
