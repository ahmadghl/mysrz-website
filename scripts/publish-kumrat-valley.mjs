#!/usr/bin/env node
// Publisher for the "Kumrat Valley" cluster (new destination hub + travel guide).
// Self-hosts two distinct CC BY-SA Wikimedia photos, inserts the destinations row
// and the blog_posts guide (both publish columns), reading secrets from
// mysrz-admin/.env.local. DRY RUN by default; pass --commit to write.
// Mirrors scripts/publish-neelum-valley.mjs.

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

const DEST_SLUG = 'kumrat-valley';
const POST_SLUG = 'kumrat-valley-travel-guide';

const destination = {
  name: 'Kumrat Valley',
  slug: DEST_SLUG,
  region: 'Khyber Pakhtunkhwa',
  description:
    "Kumrat Valley is a roughly 35 km ribbon of deodar forest, alpine meadow and rushing river in the Upper Dir district of Khyber Pakhtunkhwa, cradled by the peaks of the Hindu Kush. The clear Panjkora River runs the length of it, lined by some of the tallest cedar trees in Pakistan, and the valley floor opens into camping grounds that fill with tents through the summer. Above the forest lie the valley's headline sights: the thundering Kumrat Waterfall, the vast high pasture of Jahaz Banda at around 3,100 metres, and the glacial Katora Lake at roughly 4,000 metres, ringed by Spindhor Peak. Reached by a long drive and a final four wheel drive leg from the town of Thal, green and pleasant from May to September and deep under snow in winter, Kumrat is one of Pakistan's great forest and camping escapes.",
  best_time:
    'May to September for green meadows, open roads and pleasant 15 to 25 degree days, with July to September best for the Jahaz Banda and Katora Lake treks. December to March is snowbound and the upper valley is hard to reach',
  tags: ['Forest', 'Alpine Lakes', 'Camping', 'River Valley', 'Trekking'],
  image_credit_name: 'Mafu75',
  image_credit_website: 'https://commons.wikimedia.org/wiki/File:Kumrat_Valley,_Dir,_KPK.JPG',
  meta_title: 'Kumrat Valley: Waterfall, Jahaz Banda & Katora Guide',
  meta_description:
    'Kumrat Valley in Upper Dir, KPK: deodar forests, the Kumrat Waterfall, Jahaz Banda meadow and Katora Lake, with how to get there, best time and costs.',
  faqs: [
    { q: 'Where is Kumrat Valley?', a: 'Kumrat Valley is in the Upper Dir district of Khyber Pakhtunkhwa, in northern Pakistan, running about 35 km along the Panjkora River through deodar forest at the foot of the Hindu Kush.' },
    { q: 'How do you get to Kumrat Valley?', a: 'Drive from Islamabad via the Swat Motorway to Chakdara, then the N-45 through Timergara and Dir to Thal, about 370 to 385 km and 8 to 9 hours. From Thal the last leg to the valley needs a four wheel drive jeep.' },
    { q: 'What is the best time to visit Kumrat Valley?', a: 'May to September, when the meadows are green and roads are open, with July to September best for the Jahaz Banda and Katora Lake treks. Winter brings heavy snow and the upper valley becomes hard to reach.' },
    { q: 'Do you need a 4x4 for Kumrat Valley?', a: 'Yes, for the upper valley. Normal cars reach Thal, the last town, but the final 20 to 30 km to the camping grounds and the waterfall, and the tracks toward Jahaz Banda, need a sturdy four wheel drive jeep.' },
    { q: 'What is Kumrat Valley famous for?', a: 'Kumrat is famous for its tall deodar cedar forests along the Panjkora River, the Kumrat Waterfall, the high meadow of Jahaz Banda, and the glacial Katora Lake. It is one of the best forest camping destinations in Pakistan.' },
  ],
};

const post = {
  title: 'Kumrat Valley Travel Guide (2026): Waterfall, Jahaz Banda & Katora',
  slug: POST_SLUG,
  category: 'Adventure',
  author: 'Ahmad Faraz',
  read_time: 12,
  excerpt:
    "Kumrat Valley is Pakistan's great forest escape: tall deodar cedars along the Panjkora River, the Kumrat Waterfall, the meadow of Jahaz Banda and glacial Katora Lake. Here is how to get there, the best time, what it costs and a simple 3 to 4 day plan.",
  image_credit_name: 'Zsyed2008',
  image_credit_website: 'https://commons.wikimedia.org/wiki/File:Kumrat_Valley,_District_Upper_Dir,_Khyber_Pakhtunkhwa,_Pakistan._02.jpg',
  meta_title: 'Kumrat Valley Travel Guide (2026): Jahaz Banda & Katora',
  meta_description:
    'Kumrat Valley travel guide: how to reach it from Islamabad, the Kumrat Waterfall, Jahaz Banda meadow and Katora Lake, best time, costs and a 3 to 4 day plan.',
  content: `Kumrat Valley is, for a growing number of travellers, the most beautiful forest escape in Pakistan. Tucked into the Upper Dir district of Khyber Pakhtunkhwa, it is a roughly 35 km valley of towering deodar cedars, riverside meadows and the clear, cold Panjkora River, all cradled by the peaks of the Hindu Kush. Unlike the bare high valleys further north, Kumrat is green and wooded right down to the water, which makes it Pakistan's camping country: the valley floor fills with tents through the summer, with the sound of the river and the smell of pine. This guide covers everything you need to plan a trip: how to get to Kumrat Valley, the top places to visit with real distances and altitudes, the best time to go, what it costs, the four wheel drive question, and a simple plan to tie it together.

## Kumrat Valley at a glance

- **Where:** Upper Dir district, Khyber Pakhtunkhwa, northern Pakistan.
- **Length:** about 35 km along the Panjkora River.
- **From Islamabad:** about 370 to 385 km, 8 to 9 hours plus the final jeep leg.
- **Best time:** May to September, with July to September for the high treks.
- **How long:** 3 to 5 days to do it justice.
- **Famous for:** deodar forests, the Kumrat Waterfall, Jahaz Banda meadow and Katora Lake.

## How to get to Kumrat Valley

**From Islamabad.** The drive is long but scenic. The usual route runs along the Swat Motorway (M-16) to Chakdara, then onto the N-45 highway through Timergara and the town of Dir, and on to Thal, the last town reachable by a normal vehicle. That is roughly 370 to 385 km and 8 to 9 hours of driving before the final leg. Most people break the journey or start very early.

**The final leg.** From Thal, the last 20 to 30 km up to the Kumrat camping grounds and the waterfall is a rough track of rocky sections, stream crossings and the occasional boulder. This stretch needs a sturdy four wheel drive jeep, which you hire in Thal. Ordinary cars stop at Thal.

**From Lahore.** Reckon on 11 to 12 hours, usually via Islamabad and the Swat Motorway, so most travellers either break the journey overnight or take a tour coach that handles the long haul.

**Getting around the valley.** Once you are in, local 4x4 jeeps are the workhorses for the waterfall, the camping areas and the trailheads to Jahaz Banda. Hire through your camp or hotel and share where you can to split the cost, since the jeep legs are the main variable expense of a Kumrat trip.

## Top places to visit in Kumrat Valley

- **Kumrat Waterfall**, the valley's signature sight, a powerful fall framed by cliffs and thick pine forest at around 8,000 feet, roughly 12 to 13 km from Thal and reached by 4x4 jeep. The classic Kumrat photo stop.
- **Jahaz Banda**, a vast alpine pasture at around 3,100 metres ringed by snow dusted Hindu Kush peaks, and the valley's crowning glory. It is reached by a trek of about 2 to 4 hours from the jeep drop off point, with the full route running around 14 km and 7 to 8 hours for those starting lower down. The meadow is a popular overnight camp.
- **Katora Lake**, a stunning glacial lake at roughly 4,000 metres above sea level, cupped beneath Spindhor Peak and reached by a roughly 6 km trek beyond Jahaz Banda. The water is so still and bowl shaped that the name means "bowl". Summertime boat rides on the lake cost from around 1,000 rupees for about an hour.
- **Kala Chashma**, the "Black Spring", famous for its crystal clear, ice cold water, a refreshing natural stop within the valley's wider landscape.
- **The Panjkora River and the deodar forests**, the soul of Kumrat: some of the tallest cedar trees in Pakistan line level ground beside the rushing river, and simply camping among them is reason enough to come.
- **Dojanga and the upper meadows**, grazing grounds and open camping areas further up the valley, quieter than the main grounds and beautiful in high summer.
- **Badagai Pass**, the high pass at the head of the valley that links Kumrat toward the Swat side, a destination for the adventurous with the right vehicle and guide.

## Best time to visit Kumrat Valley

Kumrat is firmly seasonal. The sweet spot is **May to September**, when the valley is green, the roads are open and daytime temperatures sit at a pleasant 15 to 25 degrees. **July to September** is the most reliable window for the high treks to Jahaz Banda and Katora Lake, once the snow has cleared the upper trails. Spring brings rushing meltwater and lush forest, while early autumn is quieter and golden. From **December to March** the valley lies under heavy snow, three to eleven feet in places, with temperatures falling well below freezing, and the upper valley becomes very hard or impossible to reach. Avoid the heaviest monsoon spells, when the jeep tracks and stream crossings can wash out.

## Where to stay and camping

Kumrat is a camping destination first and foremost. The valley floor has organised campsites where you can pitch your own tent or rent one, and simple rooms and wooden huts are available too, often charging no more than around 2,000 rupees for a room that sleeps four or five. If you plan to trek to Jahaz Banda or Katora Lake and stay overnight, bring or rent a proper tent and a warm sleeping bag, because nights are cold at altitude even in summer. The main camping grounds get busy and noisy in the July to August peak and over long weekends, so for quiet, camp further up the valley or go in the shoulder months.

## What a Kumrat trip costs

Kumrat is excellent value, especially as an organised package from the cities. As a current guide:

- **3 day group / shared tour packages:** from around 14,500 to 16,500 rupees per person.
- **Family Kumrat tour packages:** around 35,000 to 38,000 rupees.
- **Jahaz Banda tour packages:** around 55,000 to 65,000 rupees.
- **Private family Katora Lake packages:** from around 85,000 up to 150,000 rupees, depending on group size, vehicle and comfort level.

Packages typically bundle transport, the jeep legs, accommodation or camping, a guide and some meals. Independent travel is cheaper still: a rented room runs to about 2,000 rupees, local food is inexpensive, and the jeep hire from Thal is the main cost to share. Always confirm exactly what is and is not included before you pay, and budget extra for the jeep legs and any boat ride at Katora Lake. For a fuller picture of trip budgets across the north, see our [Pakistan trip cost guide](/blog/pakistan-trip-cost).

## Food in Kumrat

This is camping food country. Expect hearty, simple mountain fare: barbecued meats and tikka over open fires, fresh bread, daal and rice, eggs and parathas for breakfast, and endless cups of tea. The camps and dhabas along the valley cook fresh, and trout from the rivers of the wider region appears on some menus. Carry your own snacks, water and any special supplies, because shops thin out fast above Thal and prices rise the higher you go.

## A simple three to four day plan

- **Day 1:** Drive from Islamabad via the Swat Motorway and Dir to Thal, switch to a 4x4 and head up to the Kumrat camping grounds. Overnight camping in the valley.
- **Day 2:** Jeep to the Kumrat Waterfall and explore the deodar forest and the Panjkora riverbanks, with a visit to Kala Chashma. Overnight in the valley.
- **Day 3:** The trek up to Jahaz Banda meadow, with the option to camp the night on the pasture under the peaks. Overnight Jahaz Banda or back in the valley.
- **Day 4:** For the fit and acclimatised, the trek on to Katora Lake and back, then begin the long drive home, or use the day for the return journey.

## Practical tips

- **4x4 above Thal:** ordinary cars stop at Thal, so arrange a jeep there for the camping grounds, the waterfall and the trailheads.
- **Carry cash:** there are no card machines in the valley, so bring enough rupees for jeeps, camping, food and the boat ride.
- **Pack for cold nights:** even in summer the meadows and the lake are cold after dark, so bring warm layers and a good sleeping bag.
- **Trek gently at altitude:** Jahaz Banda and especially Katora Lake sit high, so pace the climbs and carry water.
- **Connectivity is patchy:** mobile signal fades fast above Thal, so download offline maps and tell someone your plan.
- **Leave no trace:** Kumrat's beauty is its forest and meadows, so carry your rubbish out and camp responsibly.

## A little about the forest

Kumrat's defining feature is its deodar cedar forest, among the finest in Pakistan. These towering evergreens grow on the level ground beside the Panjkora River, and the valley has long been known for its timber as well as its beauty, which is exactly why protecting the remaining forest matters so much as tourism grows. The Panjkora itself rises in these high mountains and runs south through Dir, gathering the meltwater of the Hindu Kush. For travellers, the result is a rare thing in the northern areas: deep green forest, open camping meadows and a clear river all in one valley, with high alpine lakes a day's walk above.

## Kumrat compared with the other valleys

If you are weighing Kumrat against Pakistan's other summer escapes, the difference is the forest and the camping. Where Hunza and Skardu are about bare high mountains and ancient forts, and Naran is about roadside lakes and crowds, Kumrat is about cedar woods, riverside tents and a slower, wilder feel. It pairs naturally with neighbouring Swat and Kalam on a longer Khyber Pakhtunkhwa loop. To plan the wider trip, compare regions in our [Naran vs Swat](/blog/naran-vs-swat) guide and build a route with the [northern Pakistan itinerary](/blog/northern-pakistan-itinerary).

## Related guides

Time your visit with the [best time to visit Pakistan](/blog/best-time-to-visit-pakistan) guide, plan the budget with our [Pakistan trip cost](/blog/pakistan-trip-cost) breakdown, and see the overview on the [Kumrat Valley destination page](/destinations/kumrat-valley) or browse every region on the [destinations](/destinations) page.

## Frequently asked questions

**Where is Kumrat Valley and what is it known for?**
Kumrat Valley is in the Upper Dir district of Khyber Pakhtunkhwa, running about 35 km along the Panjkora River. It is known for its tall deodar cedar forests, the Kumrat Waterfall, the high meadow of Jahaz Banda and the glacial Katora Lake, and it is one of the best forest camping destinations in Pakistan.

**How do you get to Kumrat Valley from Islamabad?**
Drive about 370 to 385 km, roughly 8 to 9 hours, via the Swat Motorway to Chakdara, then the N-45 through Timergara and Dir to Thal. From Thal, the last 20 to 30 km to the valley needs a four wheel drive jeep, which you hire in town.

**Do you need a 4x4 for Kumrat Valley?**
Yes, for the upper valley. Normal cars reach Thal, the last town, but the rough track to the camping grounds and the waterfall, and the tracks toward the trailheads, require a sturdy four wheel drive.

**When is the best time to visit Kumrat Valley?**
May to September, when the valley is green and roads are open, with July to September best for the treks to Jahaz Banda and Katora Lake. Winter brings heavy snow and the upper valley becomes very hard to reach.

**How do you reach Jahaz Banda and Katora Lake?**
Jahaz Banda is a trek of about 2 to 4 hours from the jeep drop off point, reaching a meadow at around 3,100 metres. Katora Lake is a further roughly 6 km trek beyond Jahaz Banda to a glacial lake at about 4,000 metres beneath Spindhor Peak.

**How many days do you need for Kumrat Valley?**
Three to five days lets you reach the valley, see the waterfall and forest, and trek up to Jahaz Banda and, for the fit, Katora Lake, without rushing the long drive and the high climbs.

**How much does a Kumrat Valley tour cost?**
Group tour packages start around 14,500 to 16,500 rupees per person for three days, family packages run around 35,000 to 65,000 rupees, and private Katora Lake packages range from around 85,000 to 150,000 rupees. Independent travel with a rented room and shared jeep is cheaper.

**Is Kumrat Valley safe to visit?**
Yes. Kumrat is a popular, welcoming summer destination visited by large numbers of domestic tourists. The main things to manage are the long drive, the rough 4x4 track above Thal, cold nights at altitude and the lack of mobile signal and card machines in the valley.`,
  faqs: [
    { q: 'Where is Kumrat Valley and what is it known for?', a: 'Kumrat Valley is in the Upper Dir district of Khyber Pakhtunkhwa, running about 35 km along the Panjkora River. It is known for tall deodar cedar forests, the Kumrat Waterfall, the meadow of Jahaz Banda and the glacial Katora Lake, and is one of the best forest camping destinations in Pakistan.' },
    { q: 'How do you get to Kumrat Valley from Islamabad?', a: 'Drive about 370 to 385 km, roughly 8 to 9 hours, via the Swat Motorway to Chakdara, then the N-45 through Timergara and Dir to Thal. From Thal the last 20 to 30 km needs a four wheel drive jeep hired in town.' },
    { q: 'Do you need a 4x4 for Kumrat Valley?', a: 'Yes, for the upper valley. Normal cars reach Thal, the last town, but the rough track to the camping grounds and the waterfall, and the tracks to the trailheads, require a sturdy four wheel drive jeep.' },
    { q: 'When is the best time to visit Kumrat Valley?', a: 'May to September, when the valley is green and roads are open, with July to September best for the treks to Jahaz Banda and Katora Lake. Winter brings heavy snow and the upper valley becomes very hard to reach.' },
    { q: 'How do you reach Jahaz Banda and Katora Lake?', a: 'Jahaz Banda is a trek of about 2 to 4 hours from the jeep drop off point to a meadow at around 3,100 metres. Katora Lake is a further roughly 6 km trek beyond, reaching a glacial lake at about 4,000 metres beneath Spindhor Peak.' },
    { q: 'How many days do you need for Kumrat Valley?', a: 'Three to five days lets you reach the valley, see the waterfall and forest, and trek up to Jahaz Banda and, for the fit, Katora Lake, without rushing the long drive and the high climbs.' },
    { q: 'How much does a Kumrat Valley tour cost?', a: 'Group packages start around 14,500 to 16,500 rupees per person for three days, family packages run around 35,000 to 65,000 rupees, and private Katora Lake packages range from around 85,000 to 150,000 rupees. Independent travel is cheaper.' },
  ],
};

const images = [
  { surface: 'destination', directUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Kumrat_Valley%2C_Dir%2C_KPK.JPG', license: 'CC BY-SA 3.0', storageName: 'kumrat-valley-forest-river.jpg' },
  { surface: 'post', directUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Kumrat_Valley%2C_District_Upper_Dir%2C_Khyber_Pakhtunkhwa%2C_Pakistan._02.jpg', license: 'CC BY-SA 4.0', storageName: 'kumrat-valley-meadow.jpg' },
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
  line(`\nmySRZ publisher: Kumrat Valley cluster\nmode: ${COMMIT ? 'COMMIT' : 'DRY RUN'}\nenv: ${envFile || '(none)'}`);
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
  line('\nINSERT COMPLETE. Operator: revalidate /destinations /destinations/kumrat-valley /blog /blog/kumrat-valley-travel-guide / and curl the two live URLs.');
}
main().catch((e) => { line(`\nERROR: ${e.message}`); process.exit(1); });
