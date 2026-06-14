# Cowork playbook — operating at the maintainer's standard

This is your training. Read it before every content task. It encodes the same pipeline,
rules, and hard-won lessons the maintaining agent (Claude Code) uses. Companion docs:
`CONTENT.md` (the publish mechanism), `SEO-STRATEGY.md` (the plan), `AGENTS.md` (repo rules),
`PROJECT-BRIEF.md` (A-Z context). When they conflict, `SEO-STRATEGY.md` §2 wins for content.

## 0. Pre-flight — the five mistakes, and how to never repeat them
These are the exact issues that have already cost a round. Run this checklist FIRST, every time.

1. **Your checkout may be stale → sync before you judge.** Run `git log --oneline -5` on each
   repo before claiming a file is missing or a bug exists. The maintainer merges PRs and keeps
   the local folders synced; what looks "missing" is usually already fixed on `main`. Never
   "fix" something that is already merged — you will create conflicts.
2. **Your web-fetch can return CACHED pages → never report a live bug from one read.** Before
   asserting a live-site problem (footer, image, meta), re-fetch and look for a cache-buster
   (e.g. add `?t=<something>`), or state plainly that the read may be stale. Two of three
   "live bugs" flagged in the last round were cached artifacts, not real.
3. **Know your network boundary.** Your sandbox shell has NO outbound network to Supabase or
   Wikimedia unless explicitly granted. You CAN research, write, source/license-check images,
   and build the publisher script. You CANNOT upload images, insert rows, or revalidate. Do
   not try to publish from a no-network shell — hand off the script, or use granted access.
4. **Verify DB schema against the LIVE database before building any insert** (when you have
   access) — column names can differ from migrations. If you don't have access, the operator
   verifies before running your script. Set the post's BOTH `published:true` AND
   `status:'published'`; the `destinations` table has NO `status` column (only `published`).
5. **Resize images to <=1920px before upload.** Wikimedia originals can be 20MB+, which makes
   a broken `og:image` for social. The publisher template already does this; keep it.

## 1. Your role boundary
- **You (Cowork):** research, write, source + license-check images, produce a complete,
  guarded, ready-to-run publisher script. This is where your sandbox is perfect.
- **The operator (Claude Code, or the admin panel):** runs the network side — image upload to
  Supabase, DB insert, `/api/revalidate`, live 200 + title verification.
- Deliver a package the operator can run in one shot. Do not stop half-published.

## 2. The content pipeline (every destination or post)
Follow `SEO-STRATEGY.md` §2 and `CONTENT.md`. In short:
1. **Research** real sources; every fact/number traceable.
2. **Write** original prose. **No em/en dashes anywhere** (hard-guard the payload). SEO title
   30-60, meta description 70-160, clean slug, keyworded H2s. 5-6 FAQs as <=60-word answers.
   Dense citable specifics (PKR, km, elevation, months, hours). Cross-link pillar <-> destination
   <-> related. Include an honest, real detail (safety, caveats) for E-E-A-T.
3. **Image** — one real, properly-licensed (CC/PD) photo PER surface, globally unique, never
   reused, never hotlinked. Resize <=1920px. Record author + source for the credit.
4. **Insert** via Supabase PostgREST (operator step): `destinations` row (`published:true`),
   `blog_posts` row (`published:true` AND `status:'published'`).
5. **Publish-verify** (operator step): revalidate the paths, curl live for 200 + correct title.

## 3. Daily autonomous routine
When run on a schedule, do this each time:
1. **Sync + read** `SEO-STRATEGY.md`; find the active phase; pick the top unchecked item
   (Phase 2 commercial and Phase 2.5 food are next now that Phase 1 breadth is complete).
2. **Dedupe:** list existing slugs (fetch `/blog` and `/destinations`, or have the operator
   query) and pick a genuinely new topic. Never duplicate an existing slug or near-topic.
3. **Build** the content per Section 2, fully guarded.
4. **Produce a publisher script** by cloning `scripts/publish-murree-galiyat.mjs` (see §4),
   on a new branch `content/<slug>`, plus the `SEO-STRATEGY.md` tick.
5. **Hand off:** the script is the deliverable. The operator (or a granted run) publishes +
   verifies, then bumps the live footprint count in `SEO-STRATEGY.md`.
6. **One piece per run** unless told otherwise. Quality over volume; no half-built clusters.

## 4. The publisher-script pattern
`scripts/publish-murree-galiyat.mjs` is the canonical template. For a new piece, copy it and
change only: the `destination`/`post` content objects, the two `images` entries (commonsTitle +
directUrl + storageName + credit), and the slugs. Keep intact: the dash guard, the env loader
(reads `mysrz-admin/.env.local`, never hardcodes secrets), the slug-collision preflight, the
Commons-API-with-directUrl-fallback + <=1920px resize, the dual-publish-column insert, and the
dry-run default. Always `node --check` it and run the dry run before handing off.

## 5. Final gate (paste-check before delivering)
- [ ] Synced; not duplicating merged work or an existing slug.
- [ ] No em/en dashes in any payload (the script's guard must pass).
- [ ] SEO lengths in range; 5-6 FAQs; cross-links present; one honest E-E-A-T detail.
- [ ] One unique, licensed, credited image per surface; resize step intact; no hotlinks.
- [ ] Post sets both publish columns; destination sets `published` only.
- [ ] Script: `node --check` passes, dry run clean, secrets from env only.
- [ ] Mapped to a pillar + phase in `SEO-STRATEGY.md`, with the tick on the branch.
