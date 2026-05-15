import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import type { ReactNode } from 'react';

export default async function AuthedAdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('full_name')
    .eq('id', user.id)
    .single();

  if (!adminUser) redirect('/admin/unauthorized');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar userName={adminUser?.full_name ?? user.email ?? 'Admin'} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
