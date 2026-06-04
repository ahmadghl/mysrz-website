export default function DestinationsLoading() {
  return (
    <>
      {/* Hero skeleton — mirrors the cinematic-image hero block. */}
      <div className="relative h-[70vh] animate-pulse bg-aureate-surface-container-high" />
      <div className="mx-auto max-w-aureate-container px-aureate-mobile py-16 md:px-aureate-desktop md:py-24">
        {/* Featured large card skeleton */}
        <div className="mb-20 grid grid-cols-1 gap-aureate-gutter md:grid-cols-12">
          <div className="aspect-[7/6] animate-pulse bg-aureate-surface-container-high md:col-span-7" />
          <div className="space-y-4 md:col-span-5 md:pl-12">
            <div className="h-4 w-32 animate-pulse bg-aureate-surface-container-high" />
            <div className="h-12 w-2/3 animate-pulse bg-aureate-surface-container-high" />
            <div className="h-4 w-full animate-pulse bg-aureate-surface-container-high" />
            <div className="h-4 w-5/6 animate-pulse bg-aureate-surface-container-high" />
          </div>
        </div>
        {/* Secondary cards skeleton */}
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <div className="aspect-[4/5] animate-pulse bg-aureate-surface-container-high" />
              <div className="h-4 w-24 animate-pulse bg-aureate-surface-container-high" />
              <div className="h-7 w-2/3 animate-pulse bg-aureate-surface-container-high" />
              <div className="h-4 w-full animate-pulse bg-aureate-surface-container-high" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
