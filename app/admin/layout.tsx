import type { ReactNode } from 'react';

export const metadata = { title: 'Admin · mySRZ' };

// Outer admin shell — does NOT enforce auth. Public admin routes
// (/admin/login, /admin/unauthorized) render directly under this.
// Authenticated routes live under app/admin/(authed)/ which has its
// own layout with the auth check + sidebar.
export default function AdminShellLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
