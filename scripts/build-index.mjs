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
const SCRIPT_STYLE_RE = /<(script|style)\b[\s\S]*?<\/\1>/gi;
const COMMENT_RE = /<!--[\s\S]*?-->/g;
const WHITESPACE_RE = /\s+/g;

// Return candidate source regions, best first, so snippets reflect page
// content instead of the shared nav boilerplate every page starts with.
// #main wraps banner/hero blocks and #wsite-content, but on no-header-page
// layouts the nav sits inside #main, so keep several candidates and filter.
function candidates(raw) {
  const out = [];
  const push = (re) => {
    const m = raw.match(re);
    if (m && m.index !== undefined) out.push(raw.slice(m.index));
  };
  push(/<div\s+id=["']main["']/i);
  push(/<div\s+id=["']wsite-content["']/i);
  const body = BODY_RE.exec(raw);
  if (body) out.push(body[1]);
  return out;
}

// Nav menus repeat across pages; reject any region that opens with them.
const NAV_SIGNATURE = /首頁\s*開發宗旨|Sid Automation Lab\s*Sid Automation Lab/;

function cleanText(raw) {
  return decodeEntities(
    raw.replace(COMMENT_RE, ' ').replace(SCRIPT_STYLE_RE, ' ')
  )
    .replace(TAG_RE, ' ')
    .replace(WHITESPACE_RE, ' ')
    .trim();
}

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
  const words = text.split(' ').filter(Boolean);
  return words.slice(0, n).join(' ');
}

// Pick the first candidate region that neither opens with nav boilerplate nor
// is too short to be useful; fall back to the meta description.
function pickSnippet(raw, desc) {
  for (const cand of candidates(raw)) {
    const t = cleanText(cand);
    if (t.length < 30) continue;
    if (NAV_SIGNATURE.test(t.slice(0, 120))) continue;
    return firstWords(t, 60);
  }
  return desc;
}

const REDIRECT_FILES = new Set([
  'search.html',
  'ocr-trigger-clicker.html',
]);

async function build() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const htmls = entries.filter(e => e.isFile() && e.name.endsWith('.html') && !REDIRECT_FILES.has(e.name));
  const out = [];
  for (const ent of htmls) {
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    const title = (TITLE_RE.exec(raw) || [, ''])[1].trim();
    const desc = (META_DESC.exec(raw) || [, ''])[1].trim();
    const kw = (META_KW.exec(raw) || [, ''])[1].trim();
    const snippet = pickSnippet(raw, desc);
    if (!title) continue;
    out.push({
      url: ent.name === 'index.html' ? '' : ent.name,
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
