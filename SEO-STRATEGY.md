# mySRZ Tourism — Ranking Strategy (SEO / AEO / GEO)

> Living plan for ranking **www.mysrztourism.com** as a Pakistan travel authority.
> Owner: Ahmad. Maintained by Claude across sessions. Last reviewed: 2026-06-11.
>
> **Rule: every content/SEO change must map to a pillar and a phase below.**
> If a task does not fit the plan, it does not ship until the plan is updated.

---

## 0. Goal & definitions

**Goal:** Become the highest-authority independent Pakistan travel resource, ranking page-1
in Pakistan for destination + planning queries, and getting cited by AI answer engines.

- **SEO** — classic Google ranking (relevance, authority, technical health).
- **AEO** — Answer Engine Optimization: winning featured snippets, "People Also Ask", voice.
- **GEO** — Generative Engine Optimization: being *cited* by ChatGPT, Gemini, Perplexity, AI Overviews.

**North-star metrics:** organic clicks (GSC), page-1 keyword count, AI-citation mentions,
and enquiry/contact conversions from organic.

---

## 1. The eight pillars (status)

| # | Pillar | Status | What it means |
|---|--------|--------|----------------|
| 1 | **Topical authority** | 🟡 in progress | Hub-and-spoke: destination hubs + cluster posts covering all of Pakistan |
| 2 | **Keyword & intent map** | ⬜ planned | Cover informational → commercial → transactional intent, not just info |
| 3 | **On-page + schema** | ✅ done | Titles, meta, slugs, H-structure, JSON-LD @graph on every page |
| 4 | **Technical & speed** | ✅ done | CWV, ISR, dynamic sitemap.ts + robots.ts, mobile, image opt |
| 5 | **AEO (answer engines)** | ✅ done | FAQPage schema, snippet-sized direct answers, answer-first prose |
| 6 | **GEO (AI citations)** | 🟡 in progress | Citable stats + entities done; llms.txt + brand mentions pending |
| 7 | **E-E-A-T & trust** | 🟡 in progress | Author entity exists; first-hand proof, reviews, credentials thin |
| 8 | **Off-page, local & tracking** | ⬜ planned | Backlinks, Google Business Profile, citations, GSC/GA4 loop |

---

## 2. Operating rules (always-on, every piece of content)

These are non-negotiable and already proven. See linked memory pipelines.

- **Research first:** WebSearch 2-3 angles + scrape 3-4 rich blogs for hard facts. Every
  number traceable to a source. (See `destination-content-pipeline`.)
- **No em/en dashes** — hard-guard the payload before insert. (See `no-em-dashes-in-content`.)
- **One globally-unique, self-hosted image per surface** — never reuse, never hotlink; upload
  to Supabase `media/content/`, register `media_files`, credit the source. (See
  `different-picture-per-surface`.)
- **Real photos only** for website/blog/destination; AI images are social-only. (See
  `image-generation-policy`.)
- **SEO:** title 30-60 chars, meta description 70-160, keyword H1/H2s, clean slug.
- **AEO:** 5-6 FAQs as ≤60-word direct answers, complementary across pillar/cluster.
- **GEO:** dense citable specifics (PKR, km, elevation, months, hours).
- **Cross-link** the cluster: pillar ↔ destination ↔ related destinations.
- **Publish mechanics:** set BOTH `published:true` AND `status:'published'`; verify anon-visible;
  fire `/api/revalidate`; curl the live URL for 200 + correct title.

---

## 3. Phased roadmap (the backlog we tick against)

### Phase 1 — Topical authority breadth  🟡 active
Goal: a destination + pillar guide for every major Pakistan region, plus connective hubs.

Done: Hunza (full cluster), Skardu (full cluster), Fairy Meadows, Naltar, Lahore, Swat, Naran Kaghan.

- [ ] Islamabad / Rawalpindi destination + guide (gateway hub)
- [ ] Gilgit destination + guide (route hub for the north)
- [ ] Chitral & Kalash Valleys destination + guide
- [ ] Murree & Galiyat destination + guide (mass-market anchor)
- [ ] **Connective pillar:** "Best time to visit Pakistan" (links every destination)
- [ ] **Connective pillar:** "How to plan a Pakistan trip / itinerary" hub

### Phase 2 — Commercial-intent layer  ⬜ next (highest ROI)
Goal: capture planning + buying intent, where revenue and high-value traffic live.

- [ ] "X-day Hunza itinerary" + same for Skardu, Swat, Naran
- [ ] "Hunza vs Skardu" (and other comparison posts)
- [ ] "Pakistan tour packages / costs" overview tying to contact/enquiry
- [ ] Seasonal pages ("Cherry blossom in Hunza", "Autumn in Hunza", "Skiing in Pakistan")
- [ ] Strong contact/enquiry CTA woven into commercial posts

### Phase 3 — Measurement loop  🟡 (scaffold shipped; needs Ahmad to connect)
Goal: stop publishing blind. Iterate on real query data.

- [x] `google-site-verification` via env var — `GSC_SITE_VERIFICATION` in metadata (inert until set)
- [x] GA4 loader scaffold — `components/Analytics.tsx`, gated on `NEXT_PUBLIC_GA_ID` (inert until set)
- [ ] **Ahmad:** set env vars in Vercel, then connect GSC + submit sitemap (see below)
- [ ] Monthly review: prune/expand by impressions, CTR, position

**Env vars to set in Vercel (Production) to switch measurement on:**
- `GSC_SITE_VERIFICATION` — the content value from Google Search Console's HTML-tag method.
- `NEXT_PUBLIC_GA_ID` — the GA4 measurement ID, e.g. `G-XXXXXXXXXX` (optional; the
  first-party Tracker already covers basic behaviour).

After setting `GSC_SITE_VERIFICATION` and redeploying, verify the property in GSC, then
submit `https://www.mysrztourism.com/sitemap.xml`. The sitemap is already dynamic and complete.

### Phase 4 — Off-page, local & E-E-A-T  ⬜
- [ ] Google Business Profile for mySRZ Tourism
- [ ] Local + travel directory citations (consistent NAP)
- [ ] First-hand E-E-A-T: own trip photos, "we visited" detail, testimonials/reviews
- [ ] Backlink outreach: guest posts, "best Pakistan blogs" listicles, forum answers

### Phase 5 — GEO hardening  🟡
- [x] `llms.txt` describing the site for AI engines (public/llms.txt, 2026-06-11)
- [ ] Brand-entity consistency (same name/description everywhere; sameAs links)
- [ ] Seed citations: Reddit/Quora/forum answers linking back where genuinely helpful

---

## 4. How Claude follows this

1. At the start of relevant work, read this file and the `seo-ranking-plan` memory.
2. Pick the active phase; work top-down through its unchecked boxes.
3. Tick boxes here as items ship; commit the doc with the content.
4. Never publish content that skips the Section 2 operating rules.
5. Surface when a step needs Ahmad (e.g. GSC/GA4 IDs) instead of silently skipping it.

---

## 5. Current focus

**Active phase:** Phase 1 (breadth) → roll into Phase 2 (commercial) as the base completes.
**Highest single-leverage gap:** Phase 3 measurement loop (needs Ahmad to connect GSC/GA4).
**Live footprint:** 7 destinations, 11 posts, all images unique + self-hosted, 0 hotlinks.
