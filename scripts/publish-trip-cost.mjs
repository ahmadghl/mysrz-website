#!/usr/bin/env node
// Publisher for the "Pakistan trip cost" pillar (blog post only, one CC BY image).
// The #1 off-page linkable asset + top commercial page. Reads content from
// /tmp/trip-cost.md and secrets from mysrz-admin/.env.local. DRY RUN by default;
// pass --commit to write. Mirrors scripts/publish-neelum-valley.mjs (post half only).

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

const POST_SLUG = 'pakistan-trip-cost';
const CONTENT = readFileSync('/tmp/trip-cost.md', 'utf8').trim();

const post = {
  title: 'Pakistan Trip Cost 2026: Real Budget Breakdown',
  slug: POST_SLUG,
  category: 'Other',
  author: 'Ahmad Faraz',
  read_time: 12,
  excerpt:
    'How much does a trip to Pakistan really cost? Real daily budgets, flight, visa and hotel costs, and local tour package prices in PKR for 7, 10 and 15 day trips, with worked example budgets.',
  image_credit_name: 'David Stanley (Flickr)',
  image_credit_website: 'https://commons.wikimedia.org/wiki/File:Karakoram_Highway_(39866434540).jpg',
  meta_title: 'Pakistan Trip Cost 2026: Real Budget Breakdown',
  meta_description:
    'How much does a trip to Pakistan cost in 2026? Real daily budgets, flight and visa costs, plus tour package prices in PKR for 7, 10 and 15 day trips.',
  content: CONTENT,
  faqs: [
    { q: 'How much does a Pakistan trip cost per day?', a: 'Budget travellers spend about 13 to 28 USD a day, mid range travellers about 50 to 70 USD, and comfort travellers 100 USD and up, all excluding international flights.' },
    { q: 'Is Pakistan cheap to travel?', a: 'Yes. Once you are in the country, Pakistan is one of the most affordable adventure destinations anywhere, with very low food, accommodation and transport costs. The main expense is usually getting there.' },
    { q: 'How much should I budget for a week in Pakistan?', a: 'A careful independent traveller needs roughly 175 to 430 USD for a week inside the country, plus airfare. A fully guided private week costs more because everything is included.' },
    { q: 'What is the cheapest way to tour northern Pakistan?', a: 'Book a shared group departure from your home city. Group packages start around 11,000 to 17,000 PKR for short trips and bundle transport, hotels and meals, far cheaper than a private trip.' },
    { q: 'How much does a family tour of northern Pakistan cost?', a: 'A family of four on a 3 to 5 day private package from a major city typically pays between 100,000 and 200,000 PKR all in, depending on destination, hotels and season.' },
    { q: 'Do I need to pay for a Pakistan visa?', a: 'For many nationalities the Pakistan e-Visa is free or low cost, and where a fee applies it is usually between 8 and 60 USD for a single entry tourist visa. Check your country category on the official portal.' },
  ],
};

const image = { directUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Karakoram_Highway_%2839866434540%29.jpg', license: 'CC BY 2.0', storageName: 'pakistan-trip-cost-karakoram-highway.jpg' };

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
  line(`\nmySRZ publisher: Pakistan trip cost pillar\nmode: ${COMMIT ? 'COMMIT' : 'DRY RUN'}\nenv: ${envFile || '(none)'}`);
  scanDashes(post, 'post');
  const words = post.content.replace(/[#*_>\-|]/g, ' ').split(/\s+/).filter(Boolean).length;
  line(`dash guard: clean | post words: ${words}`);
  line(`meta_title=${post.meta_title.length} | meta_desc=${post.meta_description.length}`);
  if (words < 2000) throw new Error(`post under 2000 words (${words})`);
  if (post.meta_title.length < 30 || post.meta_title.length > 60) throw new Error('meta_title out of range');
  if (post.meta_description.length < 70 || post.meta_description.length > 160) throw new Error('meta_description out of range');
  if (!COMMIT) { line('\nDRY RUN ok. Re-run with --commit.'); return; }

  if (!SB || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  if (await slugTaken('blog_posts', POST_SLUG)) throw new Error(`blog_posts.slug ${POST_SLUG} exists`);

  const got = await fetchImage(image);
  const { path, publicUrl } = await upload(image.storageName, got.bytes, got.mime);
  await pgInsert('media_files', { storage_path: path, public_url: publicUrl, filename: image.storageName, mime_type: got.mime, size_bytes: got.bytes.length, width: got.width ?? null, height: got.height ?? null, folder: 'content', alt_text: 'Karakoram Highway, Pakistan' });
  line(`image ${got.width}x${got.height} -> ${publicUrl}`);

  const postRow = await pgInsert('blog_posts', {
    title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, image_url: publicUrl,
    category: post.category, author: post.author, read_time: post.read_time, meta_title: post.meta_title, meta_description: post.meta_description,
    published: true, status: 'published', views: 0, image_credit_name: post.image_credit_name, image_credit_website: post.image_credit_website, faqs: post.faqs,
  });
  line(`post id=${postRow.id}`);
  line('\nINSERT COMPLETE. Operator: revalidate /blog /blog/pakistan-trip-cost / and curl the live URL.');
}
main().catch((e) => { line(`\nERROR: ${e.message}`); process.exit(1); });
