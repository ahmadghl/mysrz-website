'use client';
import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[Admin Error]', error); }, [error]);
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-accent hover:text-brand-primary transition-all">Try Again</button>
      </div>
    </div>
  );
}
