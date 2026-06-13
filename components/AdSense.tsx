// Google AdSense account-level loader (site verification + Auto ads).
//
// Rendered directly inside the document <head> so the real <script> tag is
// present in the server-side HTML. AdSense's ownership verifier and crawler
// look for the script in <head>; next/script's afterInteractive strategy only
// left a preload <link> there, which is why verification failed.
//
// The publisher ID is public (it appears in page source on every AdSense
// site), so it defaults to our ID and stays overridable via
// NEXT_PUBLIC_ADSENSE_ID. Returns null if explicitly blanked.
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? 'ca-pub-6248382237982919';

export function AdSense() {
  if (!ADSENSE_ID) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
      crossOrigin="anonymous"
    />
  );
}
