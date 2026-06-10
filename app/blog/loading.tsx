export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-aureate-container px-aureate-mobile py-16 md:px-aureate-desktop md:py-24">
      <div className="mb-12 max-w-3xl space-y-4">
        <div className="h-4 w-48 animate-pulse bg-aureate-surface-container-high" />
        <div className="h-14 w-72 animate-pulse bg-aureate-surface-container-high" />
        <div className="h-5 w-full max-w-xl animate-pulse bg-aureate-surface-container-high" />
      </div>
      <div className="grid grid-cols-1 gap-aureate-gutter md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-aureate-outline-variant bg-aureate-surface"
          >
            <div className="aspect-[4/5] animate-pulse bg-aureate-surface-container-high" />
            <div className="space-y-3 p-8">
              <div className="h-4 w-24 animate-pulse bg-aureate-surface-container-high" />
              <div className="h-6 w-full animate-pulse bg-aureate-surface-container-high" />
              <div className="h-4 w-2/3 animate-pulse bg-aureate-surface-container-high" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
