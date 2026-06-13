import Script from 'next/script';

// Google AdSense account-level loader (site verification + Auto ads).
//
// The publisher ID is public — it appears in page source on every AdSense
// site — so it defaults to our ID and can still be overridden with
// NEXT_PUBLIC_ADSENSE_ID if ever needed. Renders nothing if explicitly
// blanked. Mirrors the env pattern used by the GA4 Analytics loader.
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? 'ca-pub-6248382237982919';

export function AdSense() {
  if (!ADSENSE_ID) return null;
  return (
    <Script
      id="adsbygoogle-init"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
