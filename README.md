# mySRZ Tourism — website

The public site for **mySRZ Travel & Tourism**: https://www.mysrztourism.com

An independent Pakistan travel (and food) media site — destination guides, travel
itineraries, comparisons and stories. The companion CMS/admin lives in the separate
`mysrz-admin` repo; both share one Supabase project and deploy on Vercel.

## Stack
- **Next.js 15** (App Router, Server Components, ISR) + **React 19**
- **Tailwind** with the warm "Aureate" theme (tokens in `app/globals.css`)
- **Supabase** (Postgres + RLS, Storage `media` bucket) — content in `blog_posts` /
  `destinations`, CMS copy in `site_settings`
- Hosted on **Vercel**; first-party analytics via `/api/track`, plus GA4 + GSC

## Develop
```bash
npm install
npm run dev        # local dev server
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm run lint
```
Environment variables (Supabase URL/keys, `REVALIDATE_SECRET`, etc.) live in `.env.local`
and Vercel project settings — never committed. Public IDs (AdSense, GA4) are safe to commit.

## Structure
- `app/` — routes: `destinations/`, `blog/`, `about/`, `contact/`, `privacy|terms|cookies/`, `api/`
- `components/` — shared UI (NavBar, Footer, Analytics, AdSense, …)
- `lib/` — data access (`posts.ts`, `site-settings.ts`, `utils.ts`) and helpers
- `public/` — static assets, `ads.txt`, `robots`/`sitemap` sources

## Read before contributing
- **`AGENTS.md`** — operating rules (theme, content rules, engineering gate)
- **`SEO-STRATEGY.md`** — the living SEO/AEO/GEO ranking plan; map every content/SEO change to a pillar + phase
- **`PROJECT-BRIEF.md`** — A-to-Z project context

Branch → PR (never push to `main`); `tsc --noEmit` + `npm run build` must be green.
