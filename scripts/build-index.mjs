// Build search-index.json from *.html in this directory.
// Usage: node build-index.mjs
// Output: ../search-index.json (one level up)
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TITLE_RE = /<title>([\s\S]*?)<\/title>/i;
const META_DESC = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i;
const META_KW = /<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']/i;
const META_TW_DESC = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i;
const BODY_RE = /<body[^>]*>([\s\S]*?)<\/body>/i;
const TAG_RE = /<[^>]+>/g;
const WHITESPACE_RE = /\s+/g;

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·');
}

function firstWords(text, n = 200) {
  const t = text.replace(TAG_RE, ' ').replace(WHITESPACE_RE, ' ').trim();
  const words = t.split(' ').filter(Boolean);
  return words.slice(0, n).join(' ');
}

async function build() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const htmls = entries.filter(e => e.isFile() && e.name.endsWith('.html'));
  const out = [];
  for (const ent of htmls) {
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    const title = (TITLE_RE.exec(raw) || [, ''])[1].trim();
    const desc = (META_DESC.exec(raw) || [, ''])[1].trim();
    const kw = (META_KW.exec(raw) || [, ''])[1].trim();
    const body = (BODY_RE.exec(raw) || [, ''])[1];
    const snippet = firstWords(decodeEntities(body), 60);
    if (!title) continue;
    out.push({
      url: '/' + ent.name,
      title: decodeEntities(title).replace(/\s*\|\s*.*$/, '').trim(),
      keywords: decodeEntities(kw),
      snippet: decodeEntities(snippet).slice(0, 220)
    });
  }
  out.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'));
  const target = path.join(ROOT, 'search-index.json');
  await fs.writeFile(target, JSON.stringify(out, null, 2), 'utf8');
  console.log(`Wrote ${out.length} entries -> ${target}`);
}

build().catch(e => { console.error(e); process.exit(1); });
