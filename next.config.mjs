/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images for 1 day. Safe even if admin replaces an
    // image at the same URL — Next/image keys on URL+query, so a new
    // upload (different URL) or a busted `?v=` query gets a fresh
    // optimized output immediately. Default is 60s which re-runs the
    // optimizer on every CDN miss.
    minimumCacheTTL: 86400,
    remotePatterns: [
      // Wikimedia Commons CDN — homepage hero slideshow images
      // (lib/hero-slides.ts). Freely licensed landmark photos.
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  // Cache-Control overrides for /public/* assets. Default Vercel
  // behavior is `public, max-age=0, must-revalidate` which forces
  // every browser to revalidate on every navigation (cheap but adds
  // a 304 round-trip). The navbar lockup SVGs load on every page,
  // so cutting that revalidation pays off.
  //
  // Strategy:
  //   - Browser: 1 hour cache (so updates propagate quickly during
  //     active sessions if we change a lockup mid-day).
  //   - Vercel edge: 1 year cache (replaced atomically on next
  //     deploy — Vercel namespaces edge cache by deployment ID).
  //   - 7-day stale-while-revalidate: if the entry expires mid-
  //     request, serve the stale copy and refresh in the background
  //     instead of making the visitor wait.
  //
  // The Google Search Console ownership file is intentionally
  // excluded from the long cache — it's a one-shot lookup and must
  // stay live.
  async headers() {
    return [
      {
        source: '/:file(.*\\.(?:svg|ico|png|jpg|jpeg|webp|avif|woff2))',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=3600, s-maxage=31536000, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/googleab5eeb68cd25b98a.html',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
