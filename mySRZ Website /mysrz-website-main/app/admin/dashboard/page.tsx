import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { FileText, Eye, TrendingUp, PlusCircle, Edit, Globe } from 'lucide-react';
async function getStats() {
  const [{ count: totalPosts }, { count: publishedPosts }, { data: recentPosts }, { data: topPosts }] = await Promise.all([
    supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
    supabaseAdmin.from('blog_posts').select('id, title, slug, published, created_at, views').order('created_at', { ascending: false }).limit(5),
    supabaseAdmin.from('blog_posts').select('id, title, slug, views').eq('published', true).order('views', { ascending: false }).limit(3),
  ]);
  const totalViews = topPosts?.reduce((sum, p) => sum + (p.views ?? 0), 0) ?? 0;
  return { totalPosts: totalPosts ?? 0, publishedPosts: publishedPosts ?? 0, draftPosts: (totalPosts ?? 0) - (publishedPosts ?? 0), totalViews, recentPosts: recentPosts ?? [], topPosts: topPosts ?? [] };
}
export default async function DashboardPage() {
  const stats = await getStats();
  const statCards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Published', value: stats.publishedPosts, icon: Globe, color: 'bg-green-50 text-green-600' },
    { label: 'Drafts', value: stats.draftPosts, icon: Edit, color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'bg-purple-50 text-purple-600' },
  ];
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-sm text-gray-500 mt-0.5">Welcome back — here&apos;s what&apos;s happening</p></div>
        <Link href="/admin/posts/new" className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-accent hover:text-brand-primary transition-all"><PlusCircle size={15} />New Post</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon size={18} /></div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900 text-sm">Recent Posts</h2>
            <Link href="/admin/posts" className="text-xs text-brand-accent font-medium hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentPosts.length === 0 && <div className="px-6 py-8 text-center text-sm text-gray-400">No posts yet. <Link href="/admin/posts/new" className="text-brand-accent font-medium">Create your first post</Link></div>}
            {stats.recentPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 px-6 py-3.5">
                <div className="flex-1 min-w-0"><div className="text-sm font-medium text-gray-800 truncate">{post.title}</div><div className="text-xs text-gray-400 mt-0.5">{new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${post.published ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>{post.published ? 'Live' : 'Draft'}</span>
                <Link href={`/admin/posts/${post.id}/edit`} className="text-xs text-gray-400 hover:text-brand-accent transition-colors font-medium">Edit</Link>
              </div>
            ))}
          </div>
        </div>
cat > app/admin/login/page.tsx << 'EOF'
'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError('Invalid email or password. Please try again.'); setLoading(false); return; }
    router.push('/admin/dashboard'); router.refresh();
  };
  return (
    <div className="min-h-screen bg-brand-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center shadow-lg mb-4"><SiteLogo /></div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '26px', fontWeight: 700, color: '#d4af37' }}>mySRZ</h1>
          <p className="text-xs uppercase tracking-[0.25em] text-brand-primary/40 font-medium mt-0.5">Admin Panel</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
          <h2 className="text-lg font-bold text-brand-primary mb-1">Welcome back</h2>
          <p className="text-sm text-brand-primary/50 mb-6">Sign in to manage your content</p>
          {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5"><AlertCircle size={15} className="flex-shrink-0" />{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Email Address</label>
              <div className="relative"><Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/30" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full border border-black/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" /></div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-primary/50 mb-1.5">Password</label>
              <div className="relative"><Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary/30" /><input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full border border-black/10 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-primary/30 hover:text-brand-primary/60 transition-colors">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-accent transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2">{loading ? 'Signing in…' : 'Sign In'}</button>
          </form>
        </div>
        <p className="text-center text-xs text-brand-primary/30 mt-6">mySRZ Travel & Tourism · Admin Only</p>
      </div>
    </div>
  );
}
