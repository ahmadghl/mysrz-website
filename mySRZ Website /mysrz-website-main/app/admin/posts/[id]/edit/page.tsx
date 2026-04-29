import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { PostEditorForm } from '@/components/admin/PostEditorForm';
interface Props { params: Promise<{ id: string }>; }
async function getPost(id: string) {
  const { data, error } = await supabaseAdmin.from('blog_posts').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data;
}
export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-mono">/blog/{post.slug}</p>
      </div>
      <PostEditorForm mode="edit" postId={post.id} initialData={{ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, image_url: post.image_url, category: post.category, author: post.author, read_time: post.read_time, meta_title: post.meta_title ?? '', meta_description: post.meta_description ?? '', published: post.published }} />
    </div>
  );
}
