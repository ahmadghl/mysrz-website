# mySRZ Blog Auto Drafter (n8n workflow)

Drops a fresh, AI-written Pakistan travel blog post into Supabase as a `draft`
every 3 days. You review and click "publish" when ready.

## What it does, in order

1. **Schedule trigger** every 3 days at 09:00 Asia/Karachi.
2. **SerpAPI** fetches Google Trends related queries for Pakistan travel terms.
3. **Supabase** returns the slugs of existing posts (so we don't repeat).
4. **OpenAI (gpt-4o)** picks one fresh trending topic and writes a 800–1200
   word post in mySRZ's voice. Returns structured JSON with title, excerpt,
   slug, full content, category, tags, SEO fields, and an `image_prompt`.
5. **Gemini (gemini-2.5-flash-image)** generates a 16:9 hero image from
   `image_prompt`.
6. **Supabase Storage** receives the image as `blog-images/<slug>.png`.
7. **Supabase REST** inserts the post into `blog_posts` with
   `status='draft'`, `ai_generated=true`, and the n8n run id for tracing.

## Before you import

### 1) Supabase Storage bucket

In Supabase → **Storage** → New bucket:
- Name: `blog-images`
- Public bucket: **on**

### 2) n8n environment variables

Set these in your n8n container (`environment:` section of docker-compose, or
your n8n env file). Restart n8n after adding them.

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (the service_role key, NOT anon)
GEMINI_API_KEY=your-gemini-api-key
SERPAPI_KEY=your-serpapi-key
```

> The service-role key bypasses Row Level Security. It MUST stay server-side
> (n8n only). Never put it in the frontend.

### 3) OpenAI credential

You said OpenAI is already wired in n8n. The workflow uses the
**HTTP Request** node with the predefined OpenAI credential type, so it
will pick up your existing OpenAI credential automatically. If it doesn't,
open the "OpenAI: Write Blog Post" node and select your OpenAI credential
in the Credentials dropdown.

### 4) SerpAPI key

The workflow expects `SERPAPI_KEY` as an env var (cleanest). If you'd rather
hardcode it in the node, open "SerpAPI: Google Trends" → Query Parameters →
replace the `api_key` value with your key.

## Importing the workflow

1. n8n → top-right **menu** → **Import from File**
2. Pick `blog-auto-drafter.json` (this folder)
3. Open it. You should see 11 nodes connected in a line with one fork at
   the start (Trends + Existing Slugs run in parallel, then merge).
4. Open **OpenAI: Write Blog Post** → confirm the OpenAI credential is set.
5. Save. Click **Activate** (top-right toggle).

## First test run

Don't wait 3 days for the first one — test it now:

1. Click the **▶ Execute Workflow** button at the top.
2. Watch each node turn green.
3. Open Supabase → `blog_posts` table → there should be one new row with
   `status='draft'`, `ai_generated=true`, and a populated `image_url`.
4. Open the `image_url` in a new tab — you should see the AI-generated photo.
5. If it all looks good, the schedule will keep running on its own.

## When something fails

Each node shows the error inline in n8n. Common ones:

| Error | Fix |
| --- | --- |
| OpenAI returns non-JSON | Re-run. If it keeps happening, the prompt may need to be tightened — ping me. |
| Gemini image generation fails | Check `GEMINI_API_KEY` is set + has image generation enabled in Google AI Studio. |
| Supabase 401 | `SUPABASE_SERVICE_ROLE_KEY` env var is missing or wrong. |
| Supabase 23505 (duplicate slug) | The model picked a topic too close to an existing one. Re-run; the prompt should pick a different topic next time. |

## Reviewing drafts

In Supabase Studio:
1. Open `blog_posts` table
2. Filter `status = draft` and `ai_generated = true`
3. Click any row → review title, excerpt, content, image_url
4. Edit anything you don't like (Supabase edits the row in place)
5. Change `status` from `draft` to `published`
6. The `published_at` trigger fires automatically
7. Your `/api/revalidate` webhook fires (if you wired it earlier), and the
   post appears on the live site within seconds

## Cost per post (rough)

- OpenAI gpt-4o: ~$0.04 per post (1.5K input tokens + 1.5K output tokens)
- Gemini image: ~$0.04 per image
- SerpAPI: 1 search per run, you have a plan
- Supabase: free tier covers this

So roughly **~$0.08 per draft, ~$0.80/month** at every 3 days cadence.
