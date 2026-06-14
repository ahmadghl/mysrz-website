#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// publish-murree-galiyat.mjs
//
// One-shot publisher for the "Murree & Galiyat" cluster (Phase 1, last breadth
// item). Inserts the `destinations` hub row and the `blog_posts` guide row,
// each self-hosting one globally-unique, properly-licensed Wikimedia Commons
// photo (downloaded, uploaded to Supabase Storage `media/content/`, registered
// in `media_files`, credited). No hotlinks: the stored Supabase URL is used.
//
// WHY A SCRIPT (not the admin UI): the authoring agent's shell cannot reach
// Supabase. This script is meant to run by an operator whose machine CAN reach
// Supabase (Claude Code, or a laptop), reading secrets from the gitignored
// `mysrz-admin/.env.local`. Secrets are never hardcoded here.
//
// USAGE:
//   node scripts/publish-murree-galiyat.mjs            # DRY RUN (default): prints what it will insert, writes nothing
//   node scripts/publish-murree-galiyat.mjs --commit   # actually upload images + insert rows
//
// AFTER --commit, the OPERATOR runs the publish-verify step (left out on purpose).
// The /api/revalidate route takes ONE ?path= per call, with the secret in an
// Authorization: Bearer header (the ?secret= query form still works but is
// deprecated). A Supabase DB webhook on destinations/blog_posts also fires
// revalidate automatically on insert, so this manual pass is a belt-and-braces:
//   for p in / /destinations /destinations/murree-galiyat /blog /blog/murree-galiyat-travel-guide; do
//     curl -s -X POST "https://www.mysrztourism.com/api/revalidate?path=$p" \
//          -H "Authorization: Bearer $REVALIDATE_SECRET" >/dev/null
//   done
//   then curl the two live URLs for HTTP 200 + correct <title>.
//
// Operating rules honored (SEO-STRATEGY.md S2 / AGENTS.md):
//   - No em/en dashes: a hard guard scans every string payload and ABORTS on a hit.
//   - Real, licensed, self-hosted, credited images; never reused, never hotlinked.
//   - Sets BOTH published:true AND status:'published' on the POST (RLS gates on status).
//     The destinations table has NO status column (verified in migrations), so the
//     hub row sets published:true only.
//   - Live-DB hygiene: inspects slugs + max(sort_order) before writing; aborts if a
//     slug already exists (idempotent, no orphaned uploads, no blind overwrite).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv.includes('--commit');

// ── Secrets: process.env first, then mysrz-admin/.env.local (gitignored) ─────
function loadEnvLocal() {
  const candidates = [
    process.env.ADMIN_ENV_FILE,
    resolve(__dirname, '../../mysrz-admin/.env.local'),
    resolve(__dirname, '../../../mysrz-admin/.env.local'),
  ].filter(Boolean);
  for (const file of candidates) {
    if (file && existsSync(file)) {
      for (const raw of readFileSync(file, 'utf8').split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
      }
      return file;
    }
  }
  return null;
}
const envFile = loadEnvLocal();

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || '';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || '';

// ── Content payloads ─────────────────────────────────────────────────────────
// Region spans two provinces: Murree (Punjab) + the Galiyat (Khyber Pakhtunkhwa).
const DEST_SLUG = 'murree-galiyat';
const POST_SLUG = 'murree-galiyat-travel-guide';

const destination = {
  name: 'Murree & Galiyat',
  slug: DEST_SLUG,
  region: 'Punjab & KP',
  description:
    "Murree and the Galiyat are the closest hill country to Islamabad, a cluster of forested ridges that have been Pakistan's summer escape since the British built Murree as a sanatorium in 1851. Murree town sits at about 2,300 metres, roughly 54 km and two hours from the capital up the Murree Expressway, with its pedestrian Mall Road, the Patriata cable car and chairlift, and the Pindi and Kashmir Point viewpoints. Half an hour further north, across the provincial line into Khyber Pakhtunkhwa, the Galiyat string together quieter, greener resorts: Nathia Gali at about 2,500 metres, Ayubia National Park with its level Pipeline Track through old pine and fir, and the summit trails up Mukshpuri and Miranjani. Green from April to June and September to November, deep in snow from December to February.",
  best_time:
    'April to June and September to November for green hills and clear trails; December to February for snow, with serious crowd and weather caution',
  tags: ['Hill Station', 'Snow', 'Forest Trek', 'Family', 'Weekend Trip'],
  image_credit_name: 'Saqi Pics',
  image_credit_website: 'https://commons.wikimedia.org/wiki/File:Beautiful_road_in_Murree,_Pakistan.jpg',
  meta_title: 'Murree & Galiyat Travel Guide: Hills, Snow & Treks',
  meta_description:
    'Plan Murree and the Galiyat: Mall Road, the Patriata chairlift, Nathia Gali, Ayubia, the Pipeline Track, snow season and real PKR costs from Islamabad.',
  faqs: [
    {
      q: 'Where are Murree and the Galiyat?',
      a: 'They are hill resorts north of Islamabad. Murree is about 54 km and two hours away in Punjab at roughly 2,300 metres. The Galiyat, including Nathia Gali and Ayubia, sit a little further north in Khyber Pakhtunkhwa, between about 2,400 and 2,900 metres.',
    },
    {
      q: 'Is Murree or Nathia Gali better?',
      a: 'Murree is busier, with the Mall Road bazaar, the Patriata cable car and easy access. Nathia Gali and the Galiyat are greener, cooler and quieter, with the best pine forest walks. Many visitors base in Nathia Gali and treat Murree as a stop on the way.',
    },
    {
      q: 'When does it snow in Murree?',
      a: 'Snow usually falls from December to February, with January the heaviest. Patriata, Kashmir Point and Nathia Gali hold the deepest cover. Roads can close suddenly, so check the forecast and travel midweek rather than on a snow-chasing weekend.',
    },
    {
      q: 'Can you do Murree and the Galiyat as a day trip?',
      a: 'You can see Murree in a long day from Islamabad, about two hours each way. The Galiyat deserve an overnight, since Nathia Gali is closer to three hours out and the Pipeline Track and Mukshpuri walks each take a few hours.',
    },
    {
      q: 'Are the Galiyat treks suitable for beginners?',
      a: 'The Ayubia Pipeline Track is flat and beginner friendly, about 4 km between Dunga Gali and Ayubia. Mukshpuri Top at 2,800 metres is a moderate two to three hour climb. Miranjani at 2,992 metres is harder and best done with a local guide.',
    },
  ],
};

const post = {
  title: 'Murree & Galiyat Travel Guide (2026): Snow & Forest Treks',
  slug: POST_SLUG,
  category: 'Adventure',
  author: 'Ahmad Faraz',
  read_time: 12,
  excerpt:
    "Murree and the Galiyat are Islamabad's nearest hill country: Mall Road and the Patriata cable car, the quieter pine forests of Nathia Gali and Ayubia, real PKR costs, the best season, and an honest safety note on the snow.",
  image_credit_name: 'Ymblanter',
  image_credit_website: 'https://commons.wikimedia.org/wiki/File:Nathiagali_Pipeline_Track_tunnel_1.jpg',
  meta_title: 'Murree & Galiyat Guide (2026): Snow, Hills & Forest Treks',
  meta_description:
    'Visit Murree and the Galiyat: Mall Road, Patriata, Nathia Gali, Ayubia, the Pipeline Track, Mukshpuri and Miranjani treks, snow season and real PKR costs.',
  content: `Murree and the Galiyat are the easiest mountains to reach in Pakistan. Murree town is about 54 km from Islamabad, a two hour drive up the Murree Expressway, which is why it has been the capital's summer escape since the British founded it as a hill sanatorium in 1851. The Galiyat, a string of smaller resorts just north across the line into Khyber Pakhtunkhwa, are greener and quieter, and hold the best forest walks in the region. Together they make the simplest mountain trip you can do from Islamabad, a comfortable day for Murree alone or a relaxed two to three days to add Nathia Gali and Ayubia.

This guide covers how to get there, what to see in each, the best treks, the season, real costs in rupees, and a serious safety note about the snow.

## How to reach Murree and the Galiyat

Murree is about 54 km from Islamabad and takes roughly two hours by car on the Murree Expressway. Daewoo coaches and local vans run the route for a few hundred rupees each way, while a private car for a flexible day trip typically costs about PKR 10,000 to 18,000 depending on the vehicle and how far you range.

The Galiyat lie further on. Dunga Gali, the trailhead for the Pipeline Track, is about 65 km and two to two and a half hours from Islamabad. Ayubia is around 76 km, close to two hours, and Nathia Gali is about 95 km and roughly two hours fifty by the Kashmir road. You can loop Murree and the Galiyat in one circuit, since the main road links Murree to Nathia Gali in under an hour. There is no train and no airport up here, so everything runs on the road.

## Murree: Mall Road, Patriata and the viewpoints

Murree town sits at about 2,300 metres. Its heart is the Mall Road, a pedestrian strip of shops, tea houses and snack stalls where the whole town walks in the evening. Pindi Point and Kashmir Point bookend the ridge, the first with a chairlift and the second looking out toward the mountains of Kashmir.

The big draw is Patriata, also called New Murree, the highest point in the area at about 2,286 metres. A combined cable car and chairlift carries you up over the forest, the chairlift leg running roughly 1.4 km in about 12 minutes, with tickets around PKR 1,500 per person and operating hours of about 10 a.m. to 6 p.m. Bhurban, a short drive from Murree, is the upmarket corner of the hills and home to the largest resort hotel in the region.

## The Galiyat: Nathia Gali, Ayubia and the Pipeline Track

Cross into Khyber Pakhtunkhwa and the crowds thin and the forest deepens. Nathia Gali, at about 2,500 metres, is the prettiest of the Galiyat resorts, with the colonial-era St Matthew's Church, the old Governor's House, and walking trails leading straight out of the bazaar into the trees.

Ayubia National Park is the highlight for walkers. Its famous Pipeline Track follows a level water pipeline for about 4 km between Dunga Gali and Ayubia, a 40 to 50 minute walk one way through old pine and fir at roughly 2,500 metres, with a good chance of spotting monkeys and, if you are very lucky, the park's birds and leopards' prey. It is flat, shaded and suitable for almost anyone, which makes it the best easy walk in the region. Note that the Ayubia chairlift has been suspended since 2021 on safety grounds, so check its current status locally before counting on it.

## Best treks: Pipeline Track, Mukshpuri and Miranjani

For an easy day, the Pipeline Track described above is the one to do. For something with a summit, two trails stand out.

Mukshpuri Top reaches 2,800 metres, about 9,186 feet, and is a moderate climb of roughly 4 km from Dunga Gali that takes two to three hours up through forest to open views over Ayubia, the Galiyat ridges and, on a clear day, toward Kashmir. Miranjani is the highest peak in the Galiyat at 2,992 metres, about 9,816 feet, reached on a longer and steeper trail of around 8 km from Nathia Gali that takes four to five hours. Both trails turn icy and harder outside summer, so a local guide is strongly advised on the higher one, and essential in shoulder-season snow.

## Best time to visit

The sweet spot is late April through June and again from September to early November. In those months the trails are open, the wildflowers are out, the air is cool rather than cold, and visibility over the ridges is at its best. Autumn in particular brings dry skies and golden light to the Galiyat.

July and August are green but fall in the monsoon, so expect rain, mist and the odd landslip on mountain roads. December to February is the snow season, beautiful but demanding, covered next.

## Snow season and a serious safety note

Snow falls across Murree and the Galiyat from December to February, with January the heaviest. Patriata, Kashmir Point and Nathia Gali hold the deepest cover, and the snow is the single biggest reason day-trippers pour up from the lowlands.

That popularity has a dark side worth stating plainly. In January 2022 a snowstorm trapped tens of thousands of tourists in their cars on the roads into Murree, and about 22 people died overnight, many from hypothermia and carbon monoxide poisoning after running their engines for warmth in sealed, snowbound vehicles. An official inquiry found the town has space for roughly 5,000 cars but had let around 100,000 vehicles in, and blamed slow snow clearance and a lack of weather warnings. The lesson for any winter visit is simple: check the forecast before you leave, never drive into a forecast blizzard, book a room rather than chasing snow on a day trip, keep a window cracked if you ever shelter in a running car, and turn back early if the road ahead is choked. Snow here is a treat, not a dare.

## What it costs

Costs are modest by mountain-travel standards because the region is so accessible. The Patriata chairlift runs about PKR 1,500 per person. Budget guesthouse rooms commonly run roughly PKR 4,000 to 8,000 a night in shoulder season, mid-range hotels about PKR 10,000 to 20,000, and Bhurban's luxury resorts well above that. Rates spike sharply during the December to January snow peak and on Eid and summer holidays, while the cheapest months to stay are March and the July to August monsoon. Food is inexpensive, from Mall Road street snacks to full meals at hill-station restaurants, and local transport between resorts costs only a few hundred rupees by shared van.

## Where to stay

For Murree itself, staying near the Mall Road keeps you in walking distance of the bazaar and the Pindi Point chairlift, while Bhurban is the choice for a quieter, higher-end base. For the Galiyat, Nathia Gali is the best home, central to the Pipeline Track, Mukshpuri and Miranjani, and far calmer than Murree in peak season. Many travellers split the difference and sleep in Nathia Gali while passing through Murree on the way in or out.

## A simple two to three day plan

With two days, spend the first on Murree, the Mall Road and the Patriata cable car, then drive to Nathia Gali for the night. Give the second day to Ayubia, walking the Pipeline Track and, if you have the legs, climbing Mukshpuri. With a third day, add Miranjani with a guide, or simply slow down for the forest and the views. If you are continuing north afterward, the same Islamabad gateway feeds the Karakoram Highway and the bigger mountains beyond.

## Related guides

For the wider picture, see our [Islamabad travel guide](/blog/islamabad-travel-guide), the gateway you will pass through on the way up, and [when to visit Pakistan](/blog/best-time-to-visit-pakistan) for a month-by-month view. If you want bigger mountains next, compare the [Naran Kaghan valley](/blog/naran-kaghan-travel-guide) and [Swat](/blog/swat-valley-travel-guide), or build the trip out with our [northern Pakistan itinerary](/blog/northern-pakistan-itinerary). Browse every region on the [destinations](/destinations) page.`,
  faqs: [
    {
      q: 'How far is Murree from Islamabad?',
      a: 'Murree is about 54 km from Islamabad and takes roughly two hours by car on the Murree Expressway. Daewoo coaches and local vans also run the route for a few hundred rupees each way.',
    },
    {
      q: 'How much is the Patriata chairlift?',
      a: 'The Patriata cable car and chairlift costs about PKR 1,500 per person. The chairlift leg runs roughly 1.4 km in about 12 minutes, and operating hours are around 10 a.m. to 6 p.m.',
    },
    {
      q: 'What is the Pipeline Track in Ayubia?',
      a: 'It is a level forest walk of about 4 km between Dunga Gali and Ayubia, following an old water pipeline through pine and fir at roughly 2,500 metres. It takes 40 to 50 minutes one way and is suitable for almost anyone.',
    },
    {
      q: 'How high is Miranjani and is it hard?',
      a: 'Miranjani is the highest peak in the Galiyat at 2,992 metres, about 9,816 feet. The trail from Nathia Gali is around 8 km and takes four to five hours. It is moderately hard and best done with a local guide, especially in snow.',
    },
    {
      q: 'Is it safe to visit Murree in the snow?',
      a: 'It can be, with care. After about 22 people died in trapped cars during the January 2022 blizzard, the rule is to check the forecast, never drive into a coming storm, book a room rather than day-tripping, and turn back if roads are choked.',
    },
    {
      q: 'How many days do you need for Murree and the Galiyat?',
      a: 'One long day covers Murree alone. To add Nathia Gali, Ayubia and a forest walk or two, plan two to three days and sleep in Nathia Gali, which is the calmest and most central base in the Galiyat.',
    },
  ],
};

// ── Images: real, CC BY-SA 4.0, one per surface, self-hosted on upload ───────
const images = [
  {
    surface: 'destination',
    commonsTitle: 'File:Beautiful road in Murree, Pakistan.jpg',
    pageUrl: destination.image_credit_website,
    author: destination.image_credit_name,
    expectLicense: 'CC BY-SA 4.0',
    storageName: 'murree-galiyat-mall-road.jpg',
    altText: 'A snow-lined forested road through the hills at Murree, Pakistan',
  },
  {
    surface: 'post',
    commonsTitle: 'File:Nathiagali Pipeline Track tunnel 1.jpg',
    pageUrl: post.image_credit_website,
    author: post.image_credit_name,
    expectLicense: 'CC BY-SA 4.0',
    storageName: 'galiyat-ayubia-pipeline-track.jpg',
    altText: 'Pine forest tunnel on the Pipeline Track, Ayubia National Park, Nathia Gali',
  },
];

// ── Hard guard: no em dashes, en dashes, or related long dashes anywhere ─────
const FORBIDDEN = /[‒–—―−]/; // figure, en, em, horizontal-bar, minus
function scanDashes(value, path) {
  if (typeof value === 'string') {
    if (FORBIDDEN.test(value)) {
      const i = value.search(FORBIDDEN);
      throw new Error(
        `Forbidden dash at ${path} (char ${i}): ...${value.slice(Math.max(0, i - 25), i + 25)}...`,
      );
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, idx) => scanDashes(v, `${path}[${idx}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) scanDashes(v, `${path}.${k}`);
  }
}

// ── Supabase REST helpers ────────────────────────────────────────────────────
function sbHeaders(extra = {}) {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    ...extra,
  };
}
async function pgGet(pathAndQuery) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, { headers: sbHeaders() });
  if (!res.ok) throw new Error(`GET ${pathAndQuery} -> ${res.status} ${await res.text()}`);
  return res.json();
}
async function pgInsert(table, row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: sbHeaders({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`INSERT ${table} -> ${res.status} ${await res.text()}`);
  return (await res.json())[0];
}
async function slugTaken(table, slug) {
  const rows = await pgGet(`${table}?slug=eq.${encodeURIComponent(slug)}&select=id`);
  return rows.length > 0;
}
async function nextSortOrder() {
  const rows = await pgGet('destinations?select=sort_order&order=sort_order.desc&limit=1');
  const max = rows.length && typeof rows[0].sort_order === 'number' ? rows[0].sort_order : 0;
  return max + 10;
}

// ── Wikimedia Commons: resolve original URL + re-verify license at runtime ───
async function fetchCommonsImage(img) {
  const api =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo' +
    '&iiprop=url|extmetadata|mime|size&titles=' +
    encodeURIComponent(img.commonsTitle);
  const res = await fetch(api, { headers: { 'User-Agent': 'mySRZ-Tourism/1.0 (content pipeline)' } });
  if (!res.ok) throw new Error(`Commons API ${img.commonsTitle} -> ${res.status}`);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  const info = page && page.imageinfo && page.imageinfo[0];
  if (!info) throw new Error(`No imageinfo for ${img.commonsTitle}`);
  const license = info.extmetadata?.LicenseShortName?.value || '';
  if (!/cc|public domain/i.test(license)) {
    throw new Error(`License guard: ${img.commonsTitle} reports "${license}", not a CC/PD license. Aborting.`);
  }
  const bin = await fetch(info.url, { headers: { 'User-Agent': 'mySRZ-Tourism/1.0 (content pipeline)' } });
  if (!bin.ok) throw new Error(`Download ${info.url} -> ${bin.status}`);
  const bytes = new Uint8Array(await bin.arrayBuffer());
  return { bytes, mime: info.mime || 'image/jpeg', license, width: info.width, height: info.height, sourceUrl: info.url };
}

async function uploadToStorage(storageName, bytes, mime) {
  const path = `content/${storageName}`;
  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/media/${path}`, {
    method: 'POST',
    headers: sbHeaders({ 'Content-Type': mime, 'x-upsert': 'false' }),
    body: bytes,
  });
  if (!up.ok) throw new Error(`Storage upload ${path} -> ${up.status} ${await up.text()}`);
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/media/${path}`;
  return { path, publicUrl };
}

// ── Pretty logging ───────────────────────────────────────────────────────────
const line = (s = '') => process.stdout.write(s + '\n');
function lenFlag(label, str, lo, hi) {
  const n = str.length;
  const ok = n >= lo && n <= hi ? 'ok ' : 'OUT';
  line(`   ${ok} ${label}: ${n} chars (target ${lo}-${hi})`);
}

async function main() {
  line('');
  line('mySRZ publisher: Murree & Galiyat cluster');
  line('==========================================');
  line(`mode: ${COMMIT ? 'COMMIT (will upload + insert)' : 'DRY RUN (no writes)'}`);
  line(`env file: ${envFile || '(none found; relying on process.env)'}`);

  // 1) Dash guard over everything we will write.
  scanDashes(destination, 'destination');
  scanDashes(post, 'post');
  scanDashes(images, 'images');
  line('dash guard: clean (no em/en dashes in any payload)');

  // 2) SEO length sanity (warn-only).
  line('');
  line('field length checks:');
  lenFlag('destination.meta_title', destination.meta_title, 30, 60);
  lenFlag('destination.meta_description', destination.meta_description, 70, 160);
  lenFlag('post.title', post.title, 30, 60);
  lenFlag('post.meta_title', post.meta_title, 30, 60);
  lenFlag('post.meta_description', post.meta_description, 70, 160);
  line(`   destination FAQs: ${destination.faqs.length} | post FAQs: ${post.faqs.length}`);
  line(`   post word count (approx): ${post.content.split(/\s+/).length}`);

  // 3) Dry-run summary of the rows.
  line('');
  line('will insert DESTINATION:');
  line(`   name=${destination.name}  slug=${destination.slug}  region=${destination.region}`);
  line(`   tags=[${destination.tags.join(', ')}]  published=true  (no status column on destinations)`);
  line(`   image: ${images[0].commonsTitle} (${images[0].expectLicense}, ${images[0].author})`);
  line('will insert POST:');
  line(`   title=${post.title}`);
  line(`   slug=${post.slug}  category=${post.category}  author=${post.author}  read_time=${post.read_time}`);
  line(`   published=true AND status='published'`);
  line(`   image: ${images[1].commonsTitle} (${images[1].expectLicense}, ${images[1].author})`);

  if (!COMMIT) {
    line('');
    line('DRY RUN complete. Re-run with --commit (with Supabase reachable) to publish.');
    line('Reminder: after --commit, fire /api/revalidate and curl the two live URLs.');
    return;
  }

  // 4) Preconditions: env present, slugs free.
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them or point ADMIN_ENV_FILE at mysrz-admin/.env.local');
  }
  line('');
  line('preflight: checking slugs are free...');
  if (await slugTaken('destinations', DEST_SLUG)) throw new Error(`destinations.slug "${DEST_SLUG}" already exists. Aborting (no overwrite).`);
  if (await slugTaken('blog_posts', POST_SLUG)) throw new Error(`blog_posts.slug "${POST_SLUG}" already exists. Aborting (no overwrite).`);
  const sortOrder = await nextSortOrder();
  line(`   slugs free. next destination sort_order = ${sortOrder}`);

  // 5) Images: download from Commons, upload to Supabase, register media_files.
  const stored = {};
  for (const img of images) {
    line('');
    line(`image [${img.surface}]: ${img.commonsTitle}`);
    const got = await fetchCommonsImage(img);
    line(`   fetched ${got.width}x${got.height} ${got.mime} ${(got.bytes.length / 1024 / 1024).toFixed(2)} MB, license=${got.license}`);
    const { path, publicUrl } = await uploadToStorage(img.storageName, got.bytes, got.mime);
    await pgInsert('media_files', {
      storage_path: path,
      public_url: publicUrl,
      filename: img.storageName,
      mime_type: got.mime,
      size_bytes: got.bytes.length,
      width: got.width ?? null,
      height: got.height ?? null,
      folder: 'content',
      alt_text: img.altText,
    });
    stored[img.surface] = publicUrl;
    line(`   uploaded + indexed: ${publicUrl}`);
  }

  // 6) Insert destination (published only; no status column).
  line('');
  line('inserting destination row...');
  const destRow = await pgInsert('destinations', {
    name: destination.name,
    slug: destination.slug,
    region: destination.region,
    description: destination.description,
    best_time: destination.best_time,
    image_url: stored.destination,
    tags: destination.tags,
    published: true,
    sort_order: sortOrder,
    image_credit_name: destination.image_credit_name,
    image_credit_website: destination.image_credit_website,
    meta_title: destination.meta_title,
    meta_description: destination.meta_description,
    faqs: destination.faqs,
  });
  line(`   destination id=${destRow.id}`);

  // 7) Insert post (BOTH published:true AND status:'published').
  line('inserting blog post row...');
  const postRow = await pgInsert('blog_posts', {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    image_url: stored.post,
    category: post.category,
    author: post.author,
    read_time: post.read_time,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    published: true,
    status: 'published',
    views: 0,
    image_credit_name: post.image_credit_name,
    image_credit_website: post.image_credit_website,
    faqs: post.faqs,
  });
  line(`   post id=${postRow.id}`);

  // 8) Hand back to the operator for revalidate + verify.
  line('');
  line('INSERT COMPLETE. Operator, finish the publish-verify step:');
  line('  1) Revalidate each path (one ?path= per call, secret in Bearer header):');
  line('     for p in / /destinations /destinations/murree-galiyat /blog /blog/murree-galiyat-travel-guide; do');
  line('       curl -s -X POST "https://www.mysrztourism.com/api/revalidate?path=$p" \\');
  line('            -H "Authorization: Bearer $REVALIDATE_SECRET" >/dev/null; done');
  line('     (A Supabase DB webhook also fires revalidate on insert; this is belt-and-braces.)');
  line('  2) curl the two live URLs for HTTP 200 + correct <title>:');
  line('     https://www.mysrztourism.com/destinations/murree-galiyat');
  line('     https://www.mysrztourism.com/blog/murree-galiyat-travel-guide');
  line(`  (REVALIDATE_SECRET ${REVALIDATE_SECRET ? 'is loaded from env.' : 'NOT found; export it before step 1.'})`);
}

main().catch((err) => {
  line('');
  line(`ERROR: ${err.message}`);
  process.exit(1);
});
