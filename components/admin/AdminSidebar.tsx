'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { SiteLogo } from '@/components/SiteLogo';
import {
  FileText,
  PlusCircle,
  Globe,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const NAV = [
  { href: '/admin/posts', label: 'Blog Posts', icon: FileText },
  { href: '/admin/posts/new', label: 'New Post', icon: PlusCircle },
  { href: '/', label: 'View Website', icon: Globe, external: true },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-brand-primary min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 border-b border-white/10">
        <Link href="/admin/posts" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-accent/20 rounded-xl flex items-center justify-center">
            <SiteLogo size={20} />
          </div>
          <div>
            <div
              style={{ fontFamily: 'Georgia,serif', color: '#d4af37', fontSize: 15, fontWeight: 700 }}
            >
              mySRZ
            </div>
            <div className="text-white/30 text-[10px] uppercase tracking-widest font-medium -mt-0.5">
              Admin
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, external }) => {
          const active = pathname === href || (pathname.startsWith(href) && href !== '/');
          return (
            <Link
              key={href}
              href={href}
              target={external ? '_blank' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-brand-accent text-brand-primary'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={13} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign out */}
      <div className="px-4 pb-6 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-white/60 text-xs truncate flex-1">{userName}</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
