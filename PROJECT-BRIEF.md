# mySRZ — Project Brief (A–Z handoff)

> Single-page context for any agent/teammate (e.g. Claude Cowork) picking this up.
> Canonical, kept current by the maintaining agent. Last updated: 2026-06-14.
> Companion docs: `SEO-STRATEGY.md` (the living ranking plan) and `AGENTS.md` / `CLAUDE.md`
> (operating rules). This brief exists because the maintaining agent's session memory lives
> outside the repos, so its key context is consolidated here.

## What this is
**mySRZ Travel & Tourism** — an independent Pakistan travel (and now food) media site, aiming to be
the highest-authority independent Pakistan travel resource and to monetise via AdSense, affiliate,
and tour enquiries. Founder/owner: Ahmad Faraz.

- **Public site:** `mysrz-website` → https://www.mysrztourism.com
- **Admin/CMS:** `mysrz-admin` → https://admin.mysrztourism.com
- **Automation:** n8n at n8n.mysrztourism.com (social dispatch, forms)

## Stack
- Next.js (16.x, App Router, Server Components/Actions, ISR) on **Vercel**.
- **Supabase** (Postgres + RLS, Storage `media` bucket, pg_cron + pg_net) — single project shared
  by both apps. Content lives in `blog_posts` + `destinations`; analytics in `page_analytics`;
  social queue in `social_forge_runs`; CMS copy in `site_settings`; media in `media_files`.
- Tailwind. Admin = Outfit + Playfair; site = Aureate stack (Playfair / Source Serif 4 / Montserrat).

## Current live state (2026-06-14)
- **Content:** 10 destinations, 18 posts. Destinations: Hunza, Skardu, Fairy Meadows, Naltar,
  Lahore, Swat, Naran Kaghan, Islamabad, Gilgit, Chitral & Kalash. Posts include per-destination
  guides + clusters (things-to-do, trip-cost) + connective pillars (best-time, itinerary) +
  comparisons (Hunza vs Skardu, Naran vs Swat).
- **Admin:** fully redesigned to the approved Stitch design — responsive (mobile drawer sidebar),
  serif wordmark, real dashboard/analytics, posts/destinations/media/social/settings, /profile,
  /help. "No decorative chrome" rule: every element real or removed.
- **Social (Social Forge):** publishing a post/destination auto-generates 2 social posts
  (link + standalone) to IG/FB/X/LinkedIn/Threads with an image, via admin actions + a Supabase DB
  webhook (live DB only). Priority lane schedules new content to the next peak slots (13:30/20:30
  PKT); three lanes Up Next / Scheduled / Published; a completeness guard prevents single-platform
  dispatches; pg_cron drip POSTs /api/cron/dispatch-due once/min.
- **Monetisation:** Google AdSense submitted and **in review** (`ca-pub-6248382237982919`); loader
  in `mysrz-website/components/AdSense.tsx` + `public/ads.txt` live; CMP consent message enabled;
  legal pages (/privacy, /terms, /cookies) live.
- **Measurement (Phase 3 connected):** GSC verified (+ `mysrztourism.com` Domain property) and
  sitemap submitted; GA4 live (`G-89XDMKV9PQ`, defaulted in `components/Analytics.tsx`); plus a
  first-party tracker (`/api/track` → `page_analytics`) whose admin dashboard filters out owner +
  bot + dev sessions (ingestion via UA filter + `?notrack=1`; aggregation in `lib/analytics.ts`).

## The mandate (how this is run)
The maintaining agent owns the project **A to Z**, all hats: full-stack dev + ops, SEO/AEO/GEO
strategist, web-performance, digital + social-media growth (scale the channels, not just auto-post),
and the actual travel + food blogging. **Zero tolerance for blunders.**

## Operating rules (non-negotiable — see AGENTS.md + SEO-STRATEGY.md §2)
- **Verify, never assume.** Code: `tsc --noEmit` + `npm run build` green before any PR. Never push
  to `main` — always branch → PR. Content: research-backed (every number traceable), **no em/en
  dashes** (hard-guard payloads), one globally-unique **self-hosted** credited image per surface
  (real photos for site; AI images social-only), set BOTH `published:true` + `status:'published'`,
  then verify anon-visible + fire `/api/revalidate` + curl the live URL for 200 + correct title.
- Live-DB ops: inspect with a query before/after; never bulk-delete blind.
- Map every content/SEO change to a pillar + phase in `SEO-STRATEGY.md`.

## Roadmap (next)
1. Finish Phase 1 breadth: **Murree & Galiyat**.
2. **Food vertical** (Phase 2.5): "Pakistani food" pillar + regional + dish guides, cross-linked.
3. Phase 2 commercial: more itineraries/comparisons + a "Pakistan trip cost" pillar + enquiry CTA.
4. Depth: cluster posts for the newer destinations.
5. Data-led iteration once ~2 weeks of GSC/GA4 data lands.
6. Off-page/E-E-A-T (GBP, citations, backlinks), GEO hardening, social scaling (native short-form
   is the gap — needs raw video or a generator).

## Owner-only / open items
- 🔐 **Rotate the Supabase service-role key** (still open; security).
- Editorial sign-off, payments/identity, **merging PRs**, Google Business Profile details, and any
  first-hand trip photos/video.

## Secrets (locations only — never commit values)
`mysrz-admin/.env.local` and Vercel envs hold `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_*`,
`REVALIDATE_SECRET`, `SOCIAL_WEBHOOK_SECRET`, `OPENAI_API_KEY`, etc. n8n holds Meta/Threads tokens in
its Credentials store. Do not print or commit any secret value.
