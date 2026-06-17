#!/usr/bin/env node
// Publisher for the "Neelum Valley" cluster (new destination hub + travel guide).
// Self-hosts two distinct CC BY-SA Wikimedia photos, inserts the destinations row
// and the blog_posts guide (both publish columns), reading secrets from
// mysrz-admin/.env.local. DRY RUN by default; pass --commit to write.
// Mirrors scripts/publish-murree-galiyat.mjs.

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv.includes('--commit');

function loadEnvLocal() {
  const candidates = [resolve(__dirname, '../../mysrz-admin/.env.local'), resolve(__dirname, '../../../mysrz-admin/.env.local')];
  for (const file of candidates) {
    if (file && existsSync(file)) {
      for (const raw of readFileSync(file, 'utf8').split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('='); if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        if (!(key in process.env)) process.env[key] = val;
      }
      return file;
    }
  }
  return null;
}
const envFile = loadEnvLocal();
const SB = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const DEST_SLUG = 'neelum-valley';
const POST_SLUG = 'neelum-valley-travel-guide';

const destination = {
  name: 'Neelum Valley',
  slug: DEST_SLUG,
  region: 'Azad Kashmir',
  description:
    "Neelum Valley is the long, green jewel of Azad Kashmir, a roughly 200 km ribbon of forested hills and rushing river running northeast from Muzaffarabad to the last village at Taobat. The Neelum River traces the Line of Control for much of its length, so for stretches you look straight across the water at villages in Indian administered Kashmir. Along the way lie the riverside towns of Keran and Athmuqam, the ancient Sharada Peeth temple ruins at Sharda, the cliff top meadow village of Arang Kel reached by chairlift above Kel, and a string of alpine lakes led by the dazzling Ratti Gali. Green and accessible from April to October, snowbound in winter, it is one of the most beautiful and beginner friendly mountain escapes in Pakistan.",
  best_time:
    'April to October for green valleys and open roads, with June to September best for the high lakes like Ratti Gali. December to February is snowbound with landslide risk',
  tags: ['Kashmir', 'River Valley', 'Alpine Lakes', 'Forest', 'Family'],
  image_credit_name: 'Zuhaira.farooq',
  image_credit_website: 'https://commons.wikimedia.org/wiki/File:Arang_Kel,_Neelum_Valley,_Azad_Kashmir,_Pakistan.jpg',
  meta_title: 'Neelum Valley: Lakes, Arang Kel & Kashmir Guide',
  meta_description:
    'Neelum Valley, Azad Kashmir: Keran, Sharda, Kel, Arang Kel and Ratti Gali Lake, with how to get there, best time, costs and the NOC you need to know about.',
  faqs: [
    { q: 'Where is Neelum Valley?', a: 'Neelum Valley is in Azad Kashmir, northeast of Muzaffarabad, running about 200 km along the Neelum River up to Taobat. The river marks the Line of Control, so India administered Kashmir lies just across the water in places.' },
    { q: 'How do you get to Neelum Valley?', a: 'Drive from Islamabad via Murree and Muzaffarabad, about 235 km and five to seven hours to the lower valley. The road is paved to Sharda, then a four wheel drive is needed for Kel, Arang Kel, Taobat and the lakes.' },
    { q: 'What is the best time to visit Neelum Valley?', a: 'April to October, when the valley is green and roads are open. June to September is best for the high alpine lakes like Ratti Gali. Winter, December to February, brings heavy snow and landslides.' },
    { q: 'Do you need an NOC for Neelum Valley?', a: 'Pakistani tourists generally do not, but foreign visitors should check the current No Objection Certificate rules for Azad Kashmir and the border areas before travelling, since Neelum runs along the Line of Control.' },
    { q: 'What is the most famous place in Neelum Valley?', a: 'Arang Kel, a meadow village on a cliff top above Kel, reached by a short chairlift and a hike, is the valley icon. Ratti Gali Lake and the ancient Sharada Peeth ruins at Sharda are the other highlights.' },
  ],
};

const post = {
  title: 'Neelum Valley Travel Guide (2026): Lakes, Arang Kel & Route',
  slug: POST_SLUG,
  category: 'Adventure',
  author: 'Ahmad Faraz',
  read_time: 12,
  excerpt:
    "Neelum Valley is the green jewel of Azad Kashmir: Keran and Sharda along the river, the cliff top meadows of Arang Kel, and alpine lakes like Ratti Gali. Here is how to get there, the best time, what it costs, and the NOC to know about.",
  image_credit_name: 'Adeel ur Rehman Mughal',
  image_credit_website: 'https://commons.wikimedia.org/wiki/File:Shardah,_Neelum_Valley.jpg',
  meta_title: 'Neelum Valley Travel Guide (2026): Lakes & Arang Kel',
  meta_description:
    'Neelum Valley travel guide: how to reach it from Islamabad, Keran, Sharda, Kel, Arang Kel and Ratti Gali Lake, best time, costs, the NOC and a 4 to 5 day plan.',
  content: `Neelum Valley is, for many travellers, the most beautiful corner of Azad Kashmir, and one of the easiest mountain escapes to reach from the cities. A long, narrow valley of pine forest and terraced villages, it follows the blue green Neelum River for about 200 km, from Muzaffarabad all the way up to the last hamlet at Taobat. For much of that distance the river is the Line of Control, so you often look across the water straight into villages on the Indian side. This guide covers everything you need: how to get to Neelum Valley, the top places to visit with real distances and altitudes, the best time to go, what it costs, the NOC question, and a simple plan to tie it together.

## Neelum Valley at a glance

- **Where:** Azad Kashmir, northeast of Muzaffarabad, along the Neelum River.
- **Length:** about 200 km, Muzaffarabad to Taobat.
- **Best time:** April to October, with June to September for the high lakes.
- **How long:** 4 to 6 days to do the valley justice.
- **Famous for:** Keran, Sharda, Kel and Arang Kel, and alpine lakes like Ratti Gali.

## How to get to Neelum Valley

**From Islamabad.** The usual route runs through Murree and over the Kohala Bridge into Azad Kashmir, then to Muzaffarabad, the gateway city, about 235 km and roughly five to seven hours to the lower valley. From Muzaffarabad the single valley road heads northeast along the river. The road is paved and fine for a normal car as far as Sharda, but beyond that, for Kel, Arang Kel, Taobat and the lake trailheads, you need a sturdy four wheel drive.

**From Lahore.** About eleven hours, usually via Islamabad and Murree, so many travellers break the journey overnight or take a tour coach.

**Getting around.** Shared and private jeeps are the workhorses of the upper valley. Typical fares run in the region of 4,000 to 5,000 rupees for the Sharda to Kel leg, 7,000 to 8,000 for the Ratti Gali Lake jeep from Dowarian, and 8,000 to 9,000 onward to Taobat. Hire through your hotel and share where you can to split the cost.

## A note on the NOC and the Line of Control

Because Neelum runs right along the Line of Control, the valley has a sensitive side. Pakistani tourists travel freely, but foreign visitors should check the current No Objection Certificate requirements for Azad Kashmir and the upper border areas before setting out, since rules change. Carry your identification, follow any checkpoint instructions, and avoid filming military posts. None of this should put you off, the valley is welcoming and heavily visited, but it pays to be aware.

## The shape of the valley

Neelum unfolds in a single line along the river, which makes it easy to picture. From Muzaffarabad you pass the Kutton and Jagran side valley with its waterfall and power station, then the riverside town of Keran, which faces its twin village of the same name across the water in India. A little further is Athmuqam, the main administrative town. From Dowarian a hard track climbs to Ratti Gali Lake. The road then reaches Sharda, with its ancient temple ruins, and Kel, the launch pad for Arang Kel, Taobat and the high lakes. Knowing this order helps you plan a steady drive up the valley and back.

## Top places to visit in Neelum Valley

- **Keran**, about 115 km from Muzaffarabad, a green riverside town and one of the valley's most popular stops, looking directly across the Neelum at the Indian village of the same name.
- **Sharda**, about 156 km from Muzaffarabad at roughly 1,981 metres, home to the ruins of Sharada Peeth, an ancient temple and centre of learning that gave the Sharada script its name. A historic, atmospheric stop.
- **Kel**, about 175 km from Muzaffarabad at roughly 2,097 metres, a small town that is the gateway to the upper valley and the jumping off point for Arang Kel, Taobat and Chitta Katha Lake.
- **Arang Kel**, the valley's icon, a meadow village perched on a cliff top above Kel at around 2,550 metres, reached by a short chairlift across the river followed by a steep hike, or a roughly two hour walk. The views over the valley are unforgettable.
- **Ratti Gali Lake**, a dazzling alpine lake fed by glacial melt, reached from Dowarian by a rough jeep track and a short trek, best from June to September. One of the most beautiful lakes in Pakistan.
- **Chitta Katha Lake**, a high glacial lake above Kel in the Shounter area, a rewarding trek for the fit.
- **Shounter Lake and Valley**, a side valley off the road to Kel with meadows and a glacial lake.
- **Taobat**, the last village in the valley, about 216 km from Muzaffarabad, remote and beautiful where the Neelum River meets the Chhatri Nar.
- **Kutton and the Jagran Valley**, lower down, known for its waterfall and lush forest, an easy first stop on the way up.

## Best time to visit Neelum Valley

The valley is firmly seasonal. The sweet spot is **April to October**. Spring and early summer bring lush green hills and full rivers, while **June to September** is the only reliable window for the high alpine lakes like Ratti Gali, when the snow has cleared the trails. Autumn, in October, is quieter and golden. From **December to February** heavy snow closes the upper valley and brings landslide risk, though the lower reaches around Keran can be visited for a snowy escape. Avoid the heaviest monsoon spells in late July and August on the mountain tracks.

## Where to stay

Accommodation has grown fast across the valley, mostly in characterful wooden lodges and resorts with river views. Keran and Sharda have the widest choice, from budget guesthouses to comfortable resorts, and Kel has simpler options for those pushing on to Arang Kel and the lakes. Arang Kel itself has basic huts and camping for an unforgettable night on the meadow. Book ahead in the June to August peak and over long weekends, when the valley fills with domestic tourists.

## What it costs

Neelum is an affordable trip. Budget travellers can do it on modest daily costs, with inexpensive guesthouses and local food, while the jeep legs to the lakes and upper villages are the main variable expense. Organised tour packages from Islamabad commonly run from around 99,000 rupees for a shorter trip up to 230,000 for longer or more comfortable itineraries, typically including transport, hotels, breakfast and the jeep transfers. Independent travel by public van and shared jeep is much cheaper.

## Food in Neelum

The valley's signature is fresh river trout, often pulled from the Neelum and grilled at riverside restaurants where you can pick your own fish. Beyond that, expect hearty Kashmiri and Pahari mountain food: barbecued meats, fresh bread, rajma and rice, and plenty of salty pink Kashmiri chai. The bazaars sell Kashmiri shawls, honey, dried fruit and walnut wood crafts.

## A simple four to five day plan

- **Day 1:** Drive from Islamabad through Murree and Muzaffarabad up to Keran, with a stop at the Kutton waterfall. Overnight Keran.
- **Day 2:** The full day jeep trip to Ratti Gali Lake from Dowarian, returning to Sharda. Overnight Sharda.
- **Day 3:** Explore Sharda and the Sharada Peeth ruins, then drive to Kel. Overnight Kel.
- **Day 4:** The chairlift and hike up to Arang Kel for the meadows and views, with the option to stay the night on top. Overnight Arang Kel or Kel.
- **Day 5:** A push to Taobat for the remote upper valley, or begin the drive back with a riverside trout lunch.

## Practical tips

- **Use jeeps for the top end:** the road is paved only to Sharda, so Kel, Arang Kel, Taobat and the lakes need a four wheel drive.
- **Altitude on the lakes:** Ratti Gali and Chitta Katha sit high, so take the trek gently and carry warm layers even in summer.
- **Carry cash and ID:** card machines are scarce, and you will pass checkpoints along the Line of Control.
- **Connectivity is patchy:** the regional and one or two national networks work in the towns but fade in the high valley, so download maps offline.
- **Book ahead in summer:** Neelum is one of the most popular valleys with domestic tourists from June to August.

## A little history

Neelum takes its name from the river that runs through it. Its most famous historic site is Sharada Peeth at Sharda, the ruins of an ancient temple and centre of learning that was once among the most important seats of scholarship in the subcontinent, and which gave its name to the Sharada script long used to write Kashmiri. The wider valley was split when the Line of Control was drawn through Kashmir after 1947, which is why so many villages here look across the water at a twin settlement on the Indian side. That layered history, ancient pilgrimage and modern division, gives Neelum a poignancy beyond its scenery.

## More lakes and side valleys

Ratti Gali is the headline, but the valley hides plenty more for those who trek. Above Kel lie the glacial **Chitta Katha Lake** and the meadows and lake of the **Shounter Valley**. Toward the top end, the remote **Halmat** and **Janawai** areas and the route to **Taobat** reward slow travel, while lower down the **Jagran and Kutton** side valley offers an easy forested first stop with its waterfall. Most of the high lakes need a jeep to the trailhead and a hike beyond, and open only in the short summer.

## Related guides

Time your trip with our [best time to visit Pakistan](/blog/best-time-to-visit-pakistan) guide, compare the northern valleys in [Naran vs Swat](/blog/naran-vs-swat), and see how Kashmir fits a bigger trip in the [northern Pakistan itinerary](/blog/northern-pakistan-itinerary). See the overview on the [Neelum Valley destination page](/destinations/neelum-valley) or browse every region on the [destinations](/destinations) page.

## Frequently asked questions

**Where is Neelum Valley and what is it known for?**
Neelum Valley is in Azad Kashmir, running about 200 km along the Neelum River northeast of Muzaffarabad. It is known for green river towns like Keran and Sharda, the cliff top meadows of Arang Kel, alpine lakes such as Ratti Gali, and the fact that the river marks the Line of Control with India.

**How do you get to Neelum Valley from Islamabad?**
Drive about 235 km through Murree and Muzaffarabad, roughly five to seven hours to the lower valley. The road is paved to Sharda, after which a four wheel drive is needed for Kel, Arang Kel, Taobat and the lake trailheads.

**Do foreigners need an NOC for Neelum Valley?**
Pakistani tourists generally travel freely, but foreign visitors should check the current No Objection Certificate rules for Azad Kashmir and the upper border zones before travelling, since the valley runs along the Line of Control and rules can change.

**When is the best time to visit Neelum Valley?**
April to October. June to September is best for the high alpine lakes like Ratti Gali, while the lower valley is green and pleasant across the warmer months. Winter closes much of the upper valley with snow.

**How do you reach Arang Kel?**
From Kel, cross the river by a short chairlift, then hike up a steep path, or walk the whole way in about two hours. The meadow village sits around 2,550 metres above the valley and rewards the climb with sweeping views.

**How many days do you need for Neelum Valley?**
Four to six days lets you travel up the valley properly, taking in Keran, Sharda, Kel and Arang Kel plus a lake like Ratti Gali, without rushing the long, slow mountain roads.

**Is Neelum Valley safe to visit?**
Yes. Neelum is one of the most popular and welcoming valleys in Pakistan, visited by huge numbers of domestic tourists each summer. The only real considerations are the Line of Control checkpoints, where you follow instructions and carry your identification, and the heavy winter snow on the upper roads.

**What can you buy in Neelum Valley?**
The bazaars are known for Kashmiri shawls and woollens, pure honey, walnut wood handicrafts and dried fruit, all good value and a nice way to support the local villages along the river.`,
  faqs: [
    { q: 'Where is Neelum Valley and what is it known for?', a: 'Neelum Valley is in Azad Kashmir, running about 200 km along the Neelum River northeast of Muzaffarabad. It is known for river towns like Keran and Sharda, the meadows of Arang Kel, alpine lakes such as Ratti Gali, and the river that marks the Line of Control with India.' },
    { q: 'How do you get to Neelum Valley from Islamabad?', a: 'Drive about 235 km through Murree and Muzaffarabad, roughly five to seven hours to the lower valley. The road is paved to Sharda, after which a four wheel drive is needed for Kel, Arang Kel, Taobat and the lakes.' },
    { q: 'Do foreigners need an NOC for Neelum Valley?', a: 'Pakistani tourists generally travel freely, but foreign visitors should check the current No Objection Certificate rules for Azad Kashmir and the upper border zones before travelling, since the valley runs along the Line of Control.' },
    { q: 'When is the best time to visit Neelum Valley?', a: 'April to October, with June to September best for the high alpine lakes like Ratti Gali. The lower valley is green across the warmer months, while winter closes much of the upper valley with snow.' },
    { q: 'How do you reach Arang Kel?', a: 'From Kel, cross the river by a short chairlift then hike up a steep path, or walk the whole way in about two hours. The meadow village sits around 2,550 metres and rewards the climb with sweeping views.' },
    { q: 'How many days do you need for Neelum Valley?', a: 'Four to six days lets you travel up the valley properly, taking in Keran, Sharda, Kel and Arang Kel plus a lake like Ratti Gali, without rushing the long mountain roads.' },
  ],
};

const images = [
  { surface: 'destination', directUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Arang_Kel%2C_Neelum_Valley%2C_Azad_Kashmir%2C_Pakistan.jpg', license: 'CC BY-SA 3.0', storageName: 'neelum-valley-arang-kel.jpg' },
  { surface: 'post', directUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Shardah%2C_Neelum_Valley.jpg', license: 'CC BY-SA 4.0', storageName: 'neelum-valley-sharda-river.jpg' },
];

const FORBIDDEN = /[‒–—―−]/;
function scanDashes(value, path) {
  if (typeof value === 'string') {
    if (FORBIDDEN.test(value)) { const i = value.search(FORBIDDEN); throw new Error(`Forbidden dash at ${path}: ...${value.slice(Math.max(0, i - 25), i + 25)}...`); }
  } else if (Array.isArray(value)) value.forEach((v, i) => scanDashes(v, `${path}[${i}]`));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) scanDashes(v, `${path}.${k}`);
}
const sbHeaders = (extra = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, ...extra });
async function pgGet(q) { const r = await fetch(`${SB}/rest/v1/${q}`, { headers: sbHeaders() }); if (!r.ok) throw new Error(`GET ${q} -> ${r.status}`); return r.json(); }
async function pgInsert(t, row) { const r = await fetch(`${SB}/rest/v1/${t}`, { method: 'POST', headers: sbHeaders({ 'Content-Type': 'application/json', Prefer: 'return=representation' }), body: JSON.stringify(row) }); if (!r.ok) throw new Error(`INSERT ${t} -> ${r.status} ${await r.text()}`); return (await r.json())[0]; }
async function slugTaken(t, slug) { return (await pgGet(`${t}?slug=eq.${encodeURIComponent(slug)}&select=id`)).length > 0; }
async function nextSortOrder() { const rows = await pgGet('destinations?select=sort_order&order=sort_order.desc&limit=1'); return ((rows[0]?.sort_order) || 0) + 10; }

async function fetchImage(img) {
  const UA = { 'User-Agent': 'mySRZ-Tourism/1.0 (content pipeline)' };
  const bin = await fetch(img.directUrl, { headers: UA });
  if (!bin.ok) throw new Error(`Download ${img.directUrl} -> ${bin.status}`);
  let bytes = new Uint8Array(await bin.arrayBuffer());
  let width = null, height = null;
  try {
    const tmp = `${tmpdir()}/srz-${img.storageName}`;
    writeFileSync(tmp, bytes);
    execSync(`sips -Z 1920 ${JSON.stringify(tmp)} --out ${JSON.stringify(tmp)}`, { stdio: 'ignore' });
    const dims = execSync(`sips -g pixelWidth -g pixelHeight ${JSON.stringify(tmp)}`).toString();
    width = Number((dims.match(/pixelWidth: (\d+)/) || [])[1]) || null;
    height = Number((dims.match(/pixelHeight: (\d+)/) || [])[1]) || null;
    bytes = new Uint8Array(readFileSync(tmp)); unlinkSync(tmp);
  } catch { /* sips unavailable; upload original */ }
  return { bytes, mime: 'image/jpeg', width, height };
}
async function upload(name, bytes, mime) {
  const path = `content/${name}`;
  const up = await fetch(`${SB}/storage/v1/object/media/${path}`, { method: 'POST', headers: sbHeaders({ 'Content-Type': mime, 'x-upsert': 'false' }), body: bytes });
  if (!up.ok) throw new Error(`Storage upload ${path} -> ${up.status} ${await up.text()}`);
  return { path, publicUrl: `${SB}/storage/v1/object/public/media/${path}` };
}
const line = (s = '') => process.stdout.write(s + '\n');

async function main() {
  line(`\nmySRZ publisher: Neelum Valley cluster\nmode: ${COMMIT ? 'COMMIT' : 'DRY RUN'}\nenv: ${envFile || '(none)'}`);
  scanDashes(destination, 'destination'); scanDashes(post, 'post');
  const words = post.content.replace(/[#*_>\-|]/g, ' ').split(/\s+/).filter(Boolean).length;
  line(`dash guard: clean | post words: ${words}`);
  line(`meta_title dest=${destination.meta_title.length} post=${post.meta_title.length} | meta_desc dest=${destination.meta_description.length} post=${post.meta_description.length}`);
  if (words < 2000) throw new Error(`post under 2000 words (${words})`);
  if (post.meta_title.length > 60 || destination.meta_title.length > 60) throw new Error('meta_title too long');
  if (post.meta_description.length > 160 || destination.meta_description.length > 160) throw new Error('meta_description too long');
  if (!COMMIT) { line('\nDRY RUN ok. Re-run with --commit.'); return; }

  if (!SB || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  if (await slugTaken('destinations', DEST_SLUG)) throw new Error(`destinations.slug ${DEST_SLUG} exists`);
  if (await slugTaken('blog_posts', POST_SLUG)) throw new Error(`blog_posts.slug ${POST_SLUG} exists`);
  const sortOrder = await nextSortOrder();

  const stored = {};
  for (const img of images) {
    const got = await fetchImage(img);
    const { path, publicUrl } = await upload(img.storageName, got.bytes, got.mime);
    await pgInsert('media_files', { storage_path: path, public_url: publicUrl, filename: img.storageName, mime_type: got.mime, size_bytes: got.bytes.length, width: got.width ?? null, height: got.height ?? null, folder: 'content', alt_text: `${destination.name} (${img.surface})` });
    stored[img.surface] = publicUrl;
    line(`image [${img.surface}] ${got.width}x${got.height} -> ${publicUrl}`);
  }

  const destRow = await pgInsert('destinations', {
    name: destination.name, slug: destination.slug, region: destination.region, description: destination.description,
    best_time: destination.best_time, image_url: stored.destination, tags: destination.tags, published: true, sort_order: sortOrder,
    image_credit_name: destination.image_credit_name, image_credit_website: destination.image_credit_website,
    meta_title: destination.meta_title, meta_description: destination.meta_description, faqs: destination.faqs,
  });
  line(`destination id=${destRow.id} sort_order=${sortOrder}`);

  const postRow = await pgInsert('blog_posts', {
    title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, image_url: stored.post,
    category: post.category, author: post.author, read_time: post.read_time, meta_title: post.meta_title, meta_description: post.meta_description,
    published: true, status: 'published', views: 0, image_credit_name: post.image_credit_name, image_credit_website: post.image_credit_website, faqs: post.faqs,
  });
  line(`post id=${postRow.id}`);
  line('\nINSERT COMPLETE. Operator: revalidate /destinations /destinations/neelum-valley /blog /blog/neelum-valley-travel-guide / and curl the two live URLs.');
}
main().catch((e) => { line(`\nERROR: ${e.message}`); process.exit(1); });
