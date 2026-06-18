# mySRZ Tourism — Ranking Strategy (SEO / AEO / GEO)

> Living plan for ranking **www.mysrztourism.com** as a Pakistan travel authority.
> Owner: Ahmad. Maintained by Claude across sessions. Last reviewed: 2026-06-14.
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

- **Minimum length: 2,000 words** per post or guide (publisher hard-guards it). Thin content
  does not get indexed on a young domain.
- **Research first:** use SerpApi (`gl=pk`) for keyword intent + People-Also-Ask + top organic
  URLs, then scrape **at least 10** of those trending sources for hard facts. Every
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

Done: Hunza (full cluster), Skardu (full cluster), Fairy Meadows, Naltar, Lahore, Swat, Naran Kaghan, Islamabad, Gilgit, Chitral & Kalash, Murree & Galiyat, Neelum Valley, Kumrat Valley. **Phase 1 breadth complete — 13 destinations.**

**Content-quality remediation (2026-06-18): COMPLETE.** All 22 blog posts now ≥2,000 words (was 8 thin, down to 0), SerpApi-researched. This closes the GSC "Crawled, currently not indexed" root cause.

- [x] Islamabad / Rawalpindi destination + guide (gateway hub) (2026-06-13)
- [x] Gilgit destination + guide (route hub for the north) (2026-06-13)
- [x] Chitral & Kalash Valleys destination + guide (2026-06-13)
- [x] Murree & Galiyat destination + guide (mass-market anchor) (published 2026-06-14, via `scripts/publish-murree-galiyat.mjs`)
- [x] **Connective pillar:** "Best time to visit Pakistan" (links every destination) (2026-06-11)
- [x] **Connective pillar:** "How to plan a Pakistan trip / itinerary" hub → Northern Pakistan itinerary (2026-06-11)

### Phase 2 — Commercial-intent layer  🟡 active (highest ROI)
Goal: capture planning + buying intent, where revenue and high-value traffic live.

- [x] Northern Pakistan 10-day itinerary (2026-06-11)
- [x] "Hunza vs Skardu" comparison (2026-06-11)
- [ ] More itineraries: Skardu-focused, Swat/Kalam, Naran loop
- [x] "Naran vs Swat" comparison (2026-06-12)
- [ ] More comparisons: "Fairy Meadows vs Deosai", "Kalam vs Naran"
- [ ] "Pakistan tour packages / costs" overview tying to contact/enquiry
- [ ] Seasonal pages ("Cherry blossom in Hunza", "Autumn in Hunza", "Skiing in Pakistan")
- [ ] Strong contact/enquiry CTA woven into commercial posts

### Phase 2.5 — Food vertical  🟡 new (2026-06-14)
Goal: own Pakistani food search the way we own travel. High volume, evergreen, and it
cross-links naturally into the destination guides. Same operating rules (Section 2) apply.

- [ ] Pillar: "Pakistani food guide" (cuisine overview + must-try dishes)
- [ ] Regional food guides tied to destinations (Lahore food street, Gilgit-Baltistan/Hunza, Peshawar/Chitral, Karachi)
- [ ] Dish deep-dives (nihari, chapli kabab, biryani, Hunza apricot/walnut, etc.)
- [ ] Cross-link food ↔ destination guides both ways

### Phase 3 — Measurement loop  ✅ connected (2026-06-14)
Goal: stop publishing blind. Iterate on real query data.

- [x] GA4 loader — `components/Analytics.tsx`, defaults to `G-89XDMKV9PQ` (overridable via `NEXT_PUBLIC_GA_ID`) (2026-06-14)
- [x] GSC connected — `www` + `mysrztourism.com` Domain property verified, sitemap submitted, crawling (2026-06-14)
- [x] GA4 live — tag confirmed firing in Realtime (first_visit / page_view / session_start) (2026-06-14)
- [ ] Monthly review: prune/expand by impressions, CTR, position (begin ~end-June, once ~2 weeks of data lands)

**Note (2026-06-14):** GSC verified via the `mysrztourism.com` Domain property (DNS), so
`GSC_SITE_VERIFICATION` was not needed and stays unset. GA4 ships with its real (public) ID
defaulted in code, so no env var is required either. Both are live with zero Vercel config.

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

**Active phase:** Phase 1 breadth complete (13 destinations; Neelum + Kumrat added 2026-06-18). Content-quality remediation complete (all 22 posts ≥2,000 words, 2026-06-18). The trip-cost pillar is live (off-page linkable asset #1). Now rolling into the rest of Phase 2 (more itineraries/comparisons, seasonal pages) and the untouched Phase 2.5 food vertical.
**Off-page (Phase 4):** GBP live + in sameAs, OFF-PAGE-PLAN.md built, trip-cost linkable asset published; directories/outreach are owner-executed.
**Measurement:** Phase 3 connected (GSC + GA4 live, 2026-06-14) — let ~2 weeks of data accumulate, then iterate on real queries.
**Monetization:** Google AdSense submitted and in review (`ca-pub-6248382237982919`); loader + ads.txt live.
**Live footprint:** 11 destinations, 19 posts, all images unique + self-hosted, 0 hotlinks.
