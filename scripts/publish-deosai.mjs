#!/usr/bin/env node
// Publisher for the "Deosai National Park" destination hub (destination only,
// one CC BY-SA Wikimedia photo). Needed so the Fairy Meadows vs Deosai
// comparison links to a real hub. Reads secrets from mysrz-admin/.env.local.
// DRY RUN by default; pass --commit to write. Mirrors publish-neelum-valley.mjs.

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

const DEST_SLUG = 'deosai-national-park';

const destination = {
  name: 'Deosai National Park',
  slug: DEST_SLUG,
  region: 'Gilgit-Baltistan',
  description:
    "Deosai National Park is one of the most extraordinary landscapes in Pakistan, a vast high altitude plateau between Skardu and Astore in Gilgit-Baltistan that sits at an average of around 4,100 metres, making it the second highest plateau on earth after Tibet. For the few months it is free of snow, roughly July to September, the rolling grasslands erupt into a carpet of wildflowers grazed by Himalayan brown bears and golden marmots, with the deep blue Sheosar Lake at 4,250 metres shining at its western edge. Established in 1993 to protect the endangered brown bear, whose numbers have climbed from under twenty to around seventy eight, Deosai is an IUCN wilderness area on UNESCO's tentative World Heritage list. Reached by a rough jeep track from Skardu or Astore and snowbound the rest of the year, it is a wild, otherworldly highlight of any northern trip.",
  best_time:
    'Roughly July to September, the only months Deosai is free of snow and the road is open, with late July best for the wildflowers. The plateau is snowbound and inaccessible by vehicle from October to June',
  tags: ['National Park', 'Plateau', 'Alpine Lake', 'Wildlife', 'Camping'],
  image_credit_name: 'Hammadnasim',
  image_credit_website: 'https://commons.wikimedia.org/wiki/File:Sheosar_Lake_aka_heart_lake,_Deosai_National_Park.JPG',
  meta_title: 'Deosai National Park: Plains, Bears & Sheosar Lake',
  meta_description:
    'Deosai National Park, the second highest plateau on earth: Sheosar Lake, brown bears, wildflowers, how to get there from Skardu, the season and camping.',
  faqs: [
    { q: 'Where is Deosai National Park?', a: 'Deosai National Park is a high plateau in Gilgit-Baltistan, between the Skardu and Astore districts, about 30 km from Skardu. It averages around 4,100 metres, the second highest plateau in the world after Tibet.' },
    { q: 'How do you get to Deosai?', a: 'By a rough jeep track, about three to four hours from Skardu across the plains, or from the Astore side. The road is unpaved but not especially dangerous, and a four wheel drive is essential.' },
    { q: 'What is the best time to visit Deosai?', a: 'July to September, the only months the plateau is free of snow and the road is open, with late July best for the wildflowers. From October to June Deosai is snowbound and unreachable by vehicle.' },
    { q: 'What is Deosai famous for?', a: 'Deosai is famous for being the second highest plateau on earth, for the deep blue Sheosar Lake at 4,250 metres, for its summer wildflowers, and as a refuge for the endangered Himalayan brown bear and golden marmots.' },
    { q: 'Can you camp in Deosai?', a: 'Yes. The main camping grounds are at Bara Pani, the most popular with the best views including a Nanga Parbat viewpoint, the quieter Kala Pani, and beside Sheosar Lake. Nights are very cold even in summer, so bring warm gear.' },
  ],
};

const image = { directUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Sheosar_Lake_aka_heart_lake%2C_Deosai_National_Park.JPG', license: 'CC BY-SA 4.0', storageName: 'deosai-sheosar-lake.jpg' };

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
  line(`\nmySRZ publisher: Deosai National Park destination\nmode: ${COMMIT ? 'COMMIT' : 'DRY RUN'}\nenv: ${envFile || '(none)'}`);
  scanDashes(destination, 'destination');
  line(`dash guard: clean | meta_title=${destination.meta_title.length} meta_desc=${destination.meta_description.length}`);
  if (destination.meta_title.length > 60) throw new Error('meta_title too long');
  if (destination.meta_description.length > 160) throw new Error('meta_description too long');
  if (!COMMIT) { line('\nDRY RUN ok. Re-run with --commit.'); return; }

  if (!SB || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  if (await slugTaken('destinations', DEST_SLUG)) throw new Error(`destinations.slug ${DEST_SLUG} exists`);
  const sortOrder = await nextSortOrder();

  const got = await fetchImage(image);
  const { path, publicUrl } = await upload(image.storageName, got.bytes, got.mime);
  await pgInsert('media_files', { storage_path: path, public_url: publicUrl, filename: image.storageName, mime_type: got.mime, size_bytes: got.bytes.length, width: got.width ?? null, height: got.height ?? null, folder: 'content', alt_text: 'Sheosar Lake, Deosai National Park' });
  line(`image ${got.width}x${got.height} -> ${publicUrl}`);

  const destRow = await pgInsert('destinations', {
    name: destination.name, slug: destination.slug, region: destination.region, description: destination.description,
    best_time: destination.best_time, image_url: publicUrl, tags: destination.tags, published: true, sort_order: sortOrder,
    image_credit_name: destination.image_credit_name, image_credit_website: destination.image_credit_website,
    meta_title: destination.meta_title, meta_description: destination.meta_description, faqs: destination.faqs,
  });
  line(`destination id=${destRow.id} sort_order=${sortOrder}`);
  line('\nINSERT COMPLETE. Operator: revalidate /destinations /destinations/deosai-national-park / and curl the live URL.');
}
main().catch((e) => { line(`\nERROR: ${e.message}`); process.exit(1); });
