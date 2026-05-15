export default function BlogPostLoading() {
  return (
    <article>
      <div className="relative h-[60vh] bg-brand-primary/10 animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-brand-primary/10 rounded animate-pulse" />
          <div className="h-4 w-full bg-brand-primary/10 rounded animate-pulse" />
          <div className="h-4 w-full bg-brand-primary/10 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-brand-primary/10 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-brand-primary/10 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-brand-primary/10 rounded animate-pulse" />
        </div>
      </div>
    </article>
  );
}
