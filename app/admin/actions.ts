'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// ── Types ──────────────────────────────────────────────────────────────────
export interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  category: string;
  author: string;
  read_time: number;
  meta_title?: string;
  meta_description?: string;
  published: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');

  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('id', session.user.id)
    .single();

  if (!adminUser) throw new Error('Forbidden');
  return session;
}

// ── Signed n8n webhook trigger ─────────────────────────────────────────────
async function triggerN8nWebhook(payload: Record<string, unknown>) {
  const webhookUrl = process.env.N8N_PUBLISH_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!webhookUrl) {
    console.warn('[n8n] N8N_PUBLISH_WEBHOOK_URL not set — skipping webhook');
    return;
  }

  const body = JSON.stringify(payload);
  const signature = secret
    ? crypto.createHmac('sha256', secret).update(body).digest('hex')
    : '';

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(signature ? { 'x-mysrz-signature': signature } : {}),
      },
      body,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log('[n8n] Webhook triggered successfully');
  } catch (err) {
    console.error('[n8n] Webhook failed:', err);
    // Non-fatal — post is already saved
  }
}

// ── Actions ────────────────────────────────────────────────────────────────
export async function createPost(data: PostFormData) {
  await requireAdmin();

  const slug = data.slug || generateSlug(data.title);

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .insert({
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      image_url: data.image_url,
      category: data.category,
      author: data.author,
      read_time: data.read_time,
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || data.excerpt,
      published: data.published,
      views: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Trigger n8n webhook if publishing
  if (data.published) {
    await triggerN8nWebhook({
      event: 'post_published',
      postId: post.id,
      title: post.title,
      slug: post.slug,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mysrztourism.com'}/blog/${post.slug}`,
      publishedAt: new Date().toISOString(),
    });
  }

  revalidatePath('/blog');
  revalidatePath('/');
  redirect('/admin/posts');
}

export async function updatePost(id: string, data: PostFormData) {
  await requireAdmin();

  const slug = data.slug || generateSlug(data.title);

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .update({
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      image_url: data.image_url,
      category: data.category,
      author: data.author,
      read_time: data.read_time,
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || data.excerpt,
      published: data.published,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Trigger n8n webhook if publishing for the first time (or re-publishing)
  if (data.published) {
    await triggerN8nWebhook({
      event: 'post_updated',
      postId: post.id,
      title: post.title,
      slug: post.slug,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mysrztourism.com'}/blog/${post.slug}`,
      updatedAt: new Date().toISOString(),
    });
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/');
  redirect('/admin/posts');
}

export async function deletePost(id: string) {
  await requireAdmin();

  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('slug')
    .eq('id', id)
    .single();

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/blog');
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/');
}

export async function togglePublish(id: string, published: boolean) {
  await requireAdmin();

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .update({ published })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (published) {
    await triggerN8nWebhook({
      event: 'post_published',
      postId: post.id,
      title: post.title,
      slug: post.slug,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mysrztourism.com'}/blog/${post.slug}`,
      publishedAt: new Date().toISOString(),
    });
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/');
}
