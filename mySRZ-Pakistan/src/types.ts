export type Category = 'All' | 'Adventure' | 'Culture' | 'Food' | 'Nature';

export type Page = 'home' | 'destinations' | 'blog' | 'about' | 'contact';

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: Category;
  author: string;
  created_at: string;
  read_time: number;
  views: number;
}
