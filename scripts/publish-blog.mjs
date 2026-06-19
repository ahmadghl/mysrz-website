#!/usr/bin/env node
// Generic blog-post publisher for commercial posts (one CC image, content from a
// markdown file). Usage: node scripts/publish-blog.mjs <config.json> [--commit]
// config.json fields: slug, title, category, author?, read_time?, excerpt,
//   meta_title, meta_description, faqs:[{q,a}], contentFile,
//   image:{directUrl, license, storageName, credit_name, credit_website, alt}
// Guards: dash-clean, >=2000 words, title 30-62, desc 70-160. DRY RUN by default.

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const COMMIT = args.includes('--commit');
// --draft stores the post unpublished (published=false, status='draft') so it
// is saved but not live; publish later from the admin. Guards still run.
const DRAFT = args.includes('--draft');
const cfgPath = args.find((a) => !a.startsWith('--'));
if (!cfgPath) { console.error('usage: publish-blog.mjs <config.json> [--commit]'); process.exit(1); }

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

// The website /blog page renders content as Tiptap-style HTML (the `prose`
// branch); raw markdown shows literal ## and **. So convert the authored
// markdown to HTML before storing. The in-body "Frequently asked questions"
// section is stripped because the page renders post.faqs via <FaqSection>.
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inlineMd(s) {
  return escHtml(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => `<a href="${u}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
function mdToHtml(md) {
  const faqIdx = md.search(/^##\s*Frequently asked questions\s*$/im);
  if (faqIdx >= 0) md = md.slice(0, faqIdx);
  const out = [];
  for (let b of md.trim().split(/\n\s*\n/)) {
    b = b.trim(); if (!b) continue;
    const lines = b.split('\n').map((l) => l.replace(/\s+$/, ''));
    if (lines.every((l) => /^[-*]\s+/.test(l.trim()))) {
      out.push('<ul>' + lines.map((l) => `<li>${inlineMd(l.trim().replace(/^[-*]\s+/, ''))}</li>`).join('') + '</ul>');
    } else if (/^###\s+/.test(lines[0])) {
      out.push(`<h3>${inlineMd(lines[0].replace(/^###\s+/, ''))}</h3>`);
      if (lines.length > 1) out.push(`<p>${inlineMd(lines.slice(1).join(' '))}</p>`);
    } else if (/^##\s+/.test(lines[0])) {
      out.push(`<h2>${inlineMd(lines[0].replace(/^##\s+/, ''))}</h2>`);
      if (lines.length > 1) out.push(`<p>${inlineMd(lines.slice(1).join(' '))}</p>`);
    } else {
      out.push(`<p>${inlineMd(lines.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}

const cfg = JSON.parse(readFileSync(resolve(cfgPath), 'utf8'));
const contentMd = readFileSync(resolve(cfg.contentFile), 'utf8').trim();
const content = mdToHtml(contentMd);
const post = {
  title: cfg.title, slug: cfg.slug, category: cfg.category || 'Adventure', author: cfg.author || 'Ahmad Faraz',
  read_time: cfg.read_time || 11, excerpt: cfg.excerpt, meta_title: cfg.meta_title, meta_description: cfg.meta_description,
  content, faqs: cfg.faqs || [],
  image_credit_name: cfg.image.credit_name, image_credit_website: cfg.image.credit_website,
};
const image = cfg.image;

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
  line(`\nmySRZ blog publisher: ${post.slug}\nmode: ${COMMIT ? 'COMMIT' : 'DRY RUN'}\nenv: ${envFile || '(none)'}`);
  scanDashes(post, 'post');
  const words = contentMd.replace(/[#*_>\-|]/g, ' ').split(/\s+/).filter(Boolean).length;
  line(`dash guard: clean | words: ${words} | meta_title=${post.meta_title.length} meta_desc=${post.meta_description.length} | faqs=${post.faqs.length}`);
  const VALID_CATEGORIES = ['Adventure', 'Culture', 'Food', 'Nature'];
  if (!VALID_CATEGORIES.includes(post.category)) throw new Error(`invalid category "${post.category}" — must be one of ${VALID_CATEGORIES.join(', ')} (an unknown category crashes the blog list)`);
  if (words < 2000) throw new Error(`post under 2000 words (${words})`);
  if (post.meta_title.length < 30 || post.meta_title.length > 62) throw new Error('meta_title out of range (30-62)');
  if (post.meta_description.length < 70 || post.meta_description.length > 160) throw new Error('meta_description out of range (70-160)');
  if (!COMMIT) { line('\nDRY RUN ok. Re-run with --commit.'); return; }

  if (!SB || !KEY) throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  if (await slugTaken('blog_posts', post.slug)) throw new Error(`blog_posts.slug ${post.slug} exists`);

  const got = await fetchImage(image);
  const { path, publicUrl } = await upload(image.storageName, got.bytes, got.mime);
  await pgInsert('media_files', { storage_path: path, public_url: publicUrl, filename: image.storageName, mime_type: got.mime, size_bytes: got.bytes.length, width: got.width ?? null, height: got.height ?? null, folder: 'content', alt_text: image.alt || post.title });
  line(`image ${got.width}x${got.height} -> ${publicUrl}`);

  const postRow = await pgInsert('blog_posts', {
    title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, image_url: publicUrl,
    category: post.category, author: post.author, read_time: post.read_time, meta_title: post.meta_title, meta_description: post.meta_description,
    published: !DRAFT, status: DRAFT ? 'draft' : 'published', views: 0, image_credit_name: post.image_credit_name, image_credit_website: post.image_credit_website, faqs: post.faqs,
  });
  line(`post id=${postRow.id} (${DRAFT ? 'DRAFT — not live' : 'PUBLISHED'})`);
  if (DRAFT) line(`\nDRAFT SAVED. Publish later from the admin (or flip published=true + status=published) and revalidate.`);
  else line(`\nINSERT COMPLETE. Operator: revalidate /blog /blog/${post.slug} / and curl the live URL.`);
}
main().catch((e) => { line(`\nERROR: ${e.message}`); process.exit(1); });
