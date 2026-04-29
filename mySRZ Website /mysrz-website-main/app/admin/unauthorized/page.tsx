import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-brand-paper flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldOff size={28} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-brand-primary mb-2">Access Denied</h1>
        <p className="text-brand-primary/50 text-sm mb-8">You don&apos;t have admin permissions to access this area.</p>
        <Link href="/" className="inline-block bg-brand-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-brand-accent transition-all">Back to Website</Link>
      </div>
    </div>
  );
}
