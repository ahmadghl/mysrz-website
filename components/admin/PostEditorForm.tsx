'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from './TiptapEditor';
import { createPost, updatePost, type PostFormData } from '@/app/admin/actions';
import { Save, Send, Eye, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const CATEGORIES = ['Adventure', 'Culture', 'Food', 'Nature'];

interface PostEditorFormProps {
  mode: 'new' | 'edit';
  postId?: string;
  initialData?: Partial<PostFormData>;
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export function PostEditorForm({ mode, postId, initialData }: PostEditorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [showSeo, setShowSeo] = useState(false);

  const [form, setForm] = useState<PostFormData>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    excerpt: initialData?.excerpt ?? '',
    content: initialData?.content ?? '',
    image_url: initialData?.image_url ?? '',
    category: initialData?.category ?? 'Adventure',
    author: initialData?.author ?? 'Ahmad Fraz',
    read_time: initialData?.read_time ?? 5,
    meta_title: initialData?.meta_title ?? '',
    meta_description: initialData?.meta_description ?? '',
    published: initialData?.published ?? false,
  });

  const set = (key: keyof PostFormData, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (title: string) => {
    set('title', title);
    if (mode === 'new') set('slug', slugify(title));
  };

  const handleSubmit = (publish: boolean) => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.content.trim() || form.content === '<p></p>') { setError('Content is required.'); return; }
    setError('');

    const payload = { ...form, published: publish };
    startTransition(async () => {
      try {
        if (mode === 'new') {
          await createPost(payload);
        } else if (postId) {
          await updatePost(postId, payload);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Post Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Write a compelling title…"
              className="w-full text-2xl font-bold text-gray-900 border-0 outline-none placeholder:text-gray-200 bg-transparent"
            />
            <div className="mt-3 pt-3 border-t border-gray-50">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-300 text-sm">/blog/</span>
                <input
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="flex-1 text-sm text-gray-600 border-0 outline-none bg-transparent font-mono"
                />
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Excerpt / Summary *
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              placeholder="A short description shown in blog cards and search results…"
              rows={3}
              className="w-full text-sm text-gray-700 border-0 outline-none resize-none placeholder:text-gray-300 bg-transparent leading-relaxed"
            />
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Content *
              </label>
            </div>
            <TiptapEditor
              content={form.content}
              onChange={(html) => set('content', html)}
            />
          </div>

          {/* SEO — collapsible */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">SEO Settings</span>
                <p className="text-xs text-gray-300 mt-0.5">Meta title, description for search engines</p>
              </div>
              {showSeo ? <ChevronUp size={16} className="text-gray-300" /> : <ChevronDown size={16} className="text-gray-300" />}
            </button>
            {showSeo && (
              <div className="px-6 pb-6 space-y-4 border-t border-gray-50 pt-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Meta Title
                  </label>
                  <input
                    value={form.meta_title}
                    onChange={(e) => set('meta_title', e.target.value)}
                    placeholder={form.title || 'Defaults to post title'}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  />
                  <p className="text-xs text-gray-300 mt-1">{(form.meta_title || form.title).length}/60 chars</p>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    value={form.meta_description}
                    onChange={(e) => set('meta_description', e.target.value)}
                    placeholder={form.excerpt || 'Defaults to excerpt'}
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-accent transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-300 mt-1">{(form.meta_description || form.excerpt).length}/160 chars</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — right 1/3 */}
        <div className="space-y-5">
          {/* Publish actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Publish</h3>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-brand-accent hover:text-brand-primary transition-all disabled:opacity-60"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {mode === 'new' ? 'Publish Now' : 'Save & Publish'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                <Save size={14} />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isPending}
                className="w-full text-xs text-gray-300 hover:text-gray-500 transition-colors py-1"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Cover Image URL
            </label>
            <input
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="https://…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors font-mono text-xs"
            />
            {form.image_url && (
              <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set('category', cat)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    form.category === cat
                      ? 'bg-brand-primary text-white'
                      : 'border border-gray-200 text-gray-500 hover:border-brand-accent hover:text-brand-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Author
              </label>
              <input
                value={form.author}
                onChange={(e) => set('author', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Read Time (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={form.read_time}
                onChange={(e) => set('read_time', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
          </div>

          {/* Preview link */}
          {form.slug && (
            <div className="bg-brand-accent/5 rounded-2xl border border-brand-accent/20 p-4">
              <p className="text-xs text-gray-400 mb-1">Live URL (after publish)</p>
              <p className="text-xs font-mono text-brand-accent break-all">/blog/{form.slug}</p>
              <a
                href={`/blog/${form.slug}`}
                target="_blank"
                className="flex items-center gap-1 text-xs text-brand-accent font-bold mt-2 hover:underline"
              >
                <Eye size={11} />
                Preview page
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
