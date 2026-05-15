# Database schema

The canonical Supabase schema for mySRZ Tourism lives in the **admin repo**:

> https://github.com/ahmadghl/mysrz-admin · `supabase/migrations/`

The admin panel owns content management (blog posts, categories, media, site
settings, contact submissions, newsletter subscribers, admin users) so it
also owns the migrations. This website is a read-mostly consumer of that
database (plus authoring routes under `/admin/*` that proxy through the
same tables until the admin panel takes over).

## Why no `supabase/migrations/` here

To avoid drift. Having two repos with two `migrations/` directories means
the next migration is written in one place and forgotten in the other; the
production database then disagrees with one of them. Single source of
truth wins.

## How to spin up a dev DB

Clone the admin repo as a sibling:

```bash
cd ..
git clone https://github.com/ahmadghl/mysrz-admin.git
cd mysrz-admin
supabase start
supabase db reset    # applies supabase/migrations/* in order
```

Then point this website's `.env.local` at the local Supabase URL/keys
printed by `supabase start`.

## Schema-relevant env vars consumed by the website

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser client, server client, middleware |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser client, server client, middleware |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase-admin.ts` (server-only) |
| `REVALIDATE_SECRET` | `app/api/revalidate/route.ts` (Supabase webhook) |
| `N8N_PUBLISH_WEBHOOK_URL` / `N8N_WEBHOOK_SECRET` | post-publish n8n trigger |

See `.env.example` for the full list.

## Currently-known schema discrepancies (tracked in Phase 2b)

- The public site queries `blog_posts.status='published'` while admin
  writes a boolean `published` column. The n8n blog-auto-drafter
  (`n8n/blog-auto-drafter.json`) inserts with `status='draft'`. These need
  to be reconciled into one column. Reconciliation lands in Phase 2b.
- No RLS policy migration is shipped for `blog_posts`. Either anon
  reads return zero (if RLS is enabled with no policy) or anon can see
  drafts (if RLS is disabled). Policy ships in Phase 2b.
- No `UNIQUE (slug)` constraint and no `(published, created_at DESC)`
  index on `blog_posts`. Both ship in Phase 2b.
