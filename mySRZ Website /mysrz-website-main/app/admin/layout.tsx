import { redirect } from 'next/navigation';
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import type { ReactNode } from 'react';

export const metadata = { title: 'Admin · mySRZ' };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // 1. Check session
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/admin/login');

  // 2. Check admin access via admin_users table (bypasses RLS)
  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('full_name')
    .eq('id', session.user.id)
    .single();

  if (!adminUser) redirect('/admin/unauthorized');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar userName={adminUser?.full_name ?? session.user.email ?? 'Admin'} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
