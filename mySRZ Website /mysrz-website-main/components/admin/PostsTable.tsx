'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { togglePublish, deletePost } from '@/app/admin/actions';
import { Edit, Trash2, Eye, Globe, FileText } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  created_at: string;
  views: number;
  author: string;
}

export function PostsTable({ posts }: { posts: Post[] }) {
  const [optimisticPosts, setOptimisticPosts] = useState(posts);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggle = (id: string, currentState: boolean) => {
    // Optimistic update
    setOptimisticPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, published: !currentState } : p))
    );
    startTransition(async () => {
      try {
        await togglePublish(id, !currentState);
      } catch {
        // Revert on error
        setOptimisticPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, published: currentState } : p))
        );
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deletePost(id);
        setOptimisticPosts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        alert('Failed to delete post. Please try again.');
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (optimisticPosts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText size={22} className="text-gray-300" />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">No posts yet</h3>
        <p className="text-sm text-gray-400 mb-6">Create your first blog post to get started.</p>
        <Link
          href="/admin/posts/new"
          className="inline-block bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-accent hover:text-brand-primary transition-all"
        >
          Create First Post
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-50 bg-gray-50/50">
            <th className="text-left px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
            <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
            <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
            <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Views</th>
            <th className="text-left px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="text-right px-6 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {optimisticPosts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{post.title}</div>
                <div className="text-xs text-gray-400 mt-0.5 font-mono">/{post.slug}</div>
              </td>
              <td className="px-4 py-4 hidden md:table-cell">
                <span className="text-xs bg-brand-accent/10 text-brand-primary px-2.5 py-1 rounded-full font-medium">
                  {post.category}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-400 text-xs hidden lg:table-cell">
                {new Date(post.created_at).toLocaleDateString('en-PK', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </td>
              <td className="px-4 py-4 hidden lg:table-cell">
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <Eye size={12} />
                  {(post.views ?? 0).toLocaleString()}
                </div>
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={() => handleToggle(post.id, post.published)}
                  disabled={isPending}
                  className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-all ${
                    post.published
                      ? 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-500'
                      : 'bg-amber-50 text-amber-600 hover:bg-green-50 hover:text-green-600'
                  }`}
                  title={post.published ? 'Click to unpublish' : 'Click to publish'}
                >
                  {post.published ? <Globe size={11} /> : <FileText size={11} />}
                  {post.published ? 'Live' : 'Draft'}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                      title="View on site"
                    >
                      <Eye size={14} />
                    </Link>
                  )}
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand-accent hover:bg-brand-accent/10 transition-all"
                    title="Edit post"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    disabled={deletingId === post.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-40"
                    title="Delete post"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
