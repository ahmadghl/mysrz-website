export default function DestinationsLoading() {
  return (
    <>
      <div className="bg-brand-primary text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-12 w-72 bg-white/10 rounded animate-pulse mb-4" />
          <div className="h-5 w-full max-w-2xl bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-brand-paper rounded-2xl overflow-hidden shadow-sm">
              <div className="h-52 bg-brand-primary/10 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-2/3 bg-brand-primary/10 rounded animate-pulse" />
                <div className="h-4 w-full bg-brand-primary/10 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-brand-primary/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
