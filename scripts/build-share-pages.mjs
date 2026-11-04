// Builds one tiny static page per listed pre-loved item: site/s/<id>.html
// Facebook / LINE / X crawlers do not run JavaScript, so the item photo and name must be in the HTML itself.
// Usage: node scripts/build-share-pages.mjs [--input items.json] [--out site/s]
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const SITE = 'https://piddtr-debug.github.io/kharawa-website-materials';
const outDir = resolve(arg('--out') || `${root}/site/s`);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const condTh = { new: 'ใหม่ ป้ายยังอยู่', good: 'สภาพดี', used: 'สภาพผ่านการใช้งาน' };

async function loadItems() {
  const file = arg('--input');
  if (file) return JSON.parse(readFileSync(file, 'utf8')).items;
  const cfg = readFileSync(`${root}/site/config.js`, 'utf8');
  const m = cfg.match(/https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec/);
  if (!m) { console.log('no endpoint configured, skipping'); return []; }
  const res = await fetch(`${m[0]}?action=list`, { redirect: 'follow' });
  const data = await res.json();
  if (!data || data.ok !== true || !Array.isArray(data.items)) throw new Error('bad response from Apps Script');
  return data.items;
}

function page(item) {
  const photo = (item.photos || []).find((u) => /^https:\/\/lh3\.googleusercontent\.com\/[\w\-/=.]+$/.test(u));
  const image = photo ? photo.replace(/=[ws]\d+.*$/, '') + '=w1200' : `${SITE}/assets/og-image.jpg`;
  const price = Number(item.price) > 0 ? `฿${Number(item.price).toLocaleString('en-US')}` : 'สอบถามราคา';
  const title = `${item.brand || 'KHARAWA'} ${item.name} · ${price}`;
  const desc = `${item.aiEdited === true ? 'ภาพนี้สร้าง/แต่งด้วย AI · ' : ''}ไซซ์ ${item.size || '-'} · ${condTh[item.condition] || ''} · มือสองคัดสรรโดย KHARAWA ทัก LINE @737yiaxp`;
  const url = `${SITE}/s/${item.id}.html`;
  const target = `../preloved.html#${encodeURIComponent(item.id)}`;
  return `<!doctype html>
<html lang="th"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:type" content="product" /><meta property="og:site_name" content="KHARAWA" />
<meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(desc)}" />
<meta property="og:image" content="${esc(image)}" /><meta property="og:url" content="${esc(url)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta http-equiv="refresh" content="0; url=${esc(target)}" />
</head><body><p><a href="${esc(target)}">${esc(title)}</a></p>
<script>location.replace(${JSON.stringify(target)});</script></body></html>
`;
}

const items = (await loadItems()).filter((i) => i && /^[\w-]{1,40}$/.test(String(i.id)) && i.name);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const item of items) writeFileSync(`${outDir}/${item.id}.html`, page(item));
console.log(`built ${items.length} share page(s) in ${outDir}`);
