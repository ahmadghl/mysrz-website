export default function DestinationDetailLoading() {
  return (
    <article>
      {/* Cinematic hero skeleton */}
      <div className="relative h-[90vh] animate-pulse bg-aureate-surface-container-high" />
      {/* Stats row skeleton */}
      <div className="border-b border-aureate-outline-variant bg-aureate-surface">
        <div className="mx-auto grid max-w-aureate-container grid-cols-2 gap-aureate-gutter px-aureate-mobile py-12 md:grid-cols-4 md:px-aureate-desktop">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="mx-auto h-3 w-16 animate-pulse bg-aureate-surface-container-high" />
              <div className="mx-auto h-6 w-24 animate-pulse bg-aureate-surface-container-high" />
            </div>
          ))}
        </div>
      </div>
      {/* Storytelling skeleton */}
      <div className="mx-auto max-w-aureate-container px-aureate-mobile py-24 md:px-aureate-desktop">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="space-y-4 md:col-span-5">
            <div className="h-1 w-12 bg-aureate-primary" />
            <div className="h-10 w-full animate-pulse bg-aureate-surface-container-high" />
            <div className="h-4 w-full animate-pulse bg-aureate-surface-container-high" />
            <div className="h-4 w-5/6 animate-pulse bg-aureate-surface-container-high" />
          </div>
          <div className="aspect-[4/5] animate-pulse bg-aureate-surface-container-high md:col-span-7" />
        </div>
      </div>
    </article>
  );
}
