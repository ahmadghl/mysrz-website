import Script from 'next/script';

// Google Analytics 4 loader. Renders nothing unless NEXT_PUBLIC_GA_ID
// is set in the environment (e.g. "G-XXXXXXXXXX" in Vercel), so the
// component is safe to ship inert and switches on the moment the ID is
// added — no redeploy of code needed beyond setting the env var.
//
// This complements (does not replace) the lightweight first-party
// Tracker component, which posts pageview/scroll/device events to the
// n8n webhook. GA4 adds Google-ecosystem funnels, audiences and the
// link to Google Ads / Search Console once connected. See Phase 3 of
// SEO-STRATEGY.md.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
