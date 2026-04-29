import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { PostsTable } from '@/components/admin/PostsTable';
import { PlusCircle } from 'lucide-react';
async function getPosts() {
  const { data, error } = await supabaseAdmin.from('blog_posts').select('id, title, slug, category, published, created_at, views, author').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
export default async function PostsPage() {
  const posts = await getPosts();
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''} total · {posts.filter((p) => p.published).length} published</p>
        </div>
        <Link href="/admin/posts/new" className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-accent hover:text-brand-primary transition-all"><PlusCircle size={15} />New Post</Link>
      </div>
      <PostsTable posts={posts} />
    </div>
  );
}
