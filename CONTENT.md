# How content is created & published

**Content is data, not files.** Destinations and posts are **rows in Supabase**
(`destinations` and `blog_posts` tables), not Markdown/MDX in this repo. The app renders
them: `app/destinations/[slug]` and `app/blog/[slug]` fetch via `lib/destinations.ts` /
`lib/posts.ts` (PostgREST, `...?published=eq.true`). So you will NOT find content files to
edit — publishing means writing a DB row + self-hosting its image, then revalidating.

## The pipeline (per destination or post)
1. **Research** — WebSearch/WebFetch real sources; every fact/number traceable.
2. **Write** — original prose, **no em/en dashes**. SEO title (30–60), meta description
   (70–160), clean slug, keyworded H2s, dense citable specifics (PKR, km, elevation,
   months), 5–6 FAQs as ≤60-word answers, cross-links (pillar ↔ destination ↔ related).
   Map it to a pillar + phase in `SEO-STRATEGY.md`.
3. **Image** — source ONE **real, properly-licensed** photo (e.g. Wikimedia Commons CC),
   verify it actually depicts the place, **upload it to Supabase Storage** `media/content/`
   under a globally-unique name, add a `media_files` row, and **credit the source**. Real
   photos only for the website (AI images are social-only). Never reuse an image across
   surfaces; **never hotlink** (store the Supabase URL, not the source URL).
4. **Insert the row** via Supabase PostgREST using the **service-role key**, setting BOTH
   `published: true` AND `status: 'published'` (RLS checks `status`).
5. **Publish-verify** — POST `/api/revalidate` (with `REVALIDATE_SECRET`) to refresh ISR,
   confirm the page is visible to the anon role, then curl the live URL for a 200 and the
   correct `<title>`.

## Credentials & where the work runs
- The **service-role key** and **`REVALIDATE_SECRET`** live in `mysrz-admin/.env.local`
  (gitignored) and Vercel env — never in this repo, never printed.
- The **admin app** (`mysrz-admin`) has a UI to create/publish destinations & posts and
  **auto-generates social drafts on publish** (Social Forge). That's the no-code path.

## ⚠️ Network requirement (important for sandboxed agents)
Steps 3–5 (image upload, DB insert, revalidate) require **outbound network + the secrets**.
An agent whose shell has **no network access** (e.g. a sandboxed coworker) can do steps
**1–2 fully** — research, write the complete content package, pick and license-check the
image, and produce all field values (title/slug/meta/FAQs/body + chosen image source +
credit). The actual **upload/insert/revalidate must be run by an operator with network
access** (Claude Code, which has it) or done through the **admin panel** by a human.

So the practical division of labor: **draft here → hand off the package → publish via
Claude Code or the admin UI → verify live.**
