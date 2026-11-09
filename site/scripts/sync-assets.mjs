// site/scripts/sync-assets.mjs —— 建置後的資產同步與 sitemap 產生
//
// 目的：讓 Astro 產出的 dist/ 同時保有正式站既有的靜態資產與 SEO 檔案，
// 使所有既有公開路徑（/files/*、/uploads/*、/ads.txt、/robots.txt）都繼續有效。
//
// 用法：node scripts/sync-assets.mjs（由 npm run build 自動呼叫）
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(__dirname, '..');        // site/
const REPO = path.resolve(SITE, '..');            // repo 根目錄
const DIST = path.join(SITE, 'dist');

const SITE_URL = process.env.SITE_URL || 'https://sid-1996.github.io/sid-automation-lab';

/** 從 repo 根目錄同步到 dist/ 的項目（保持既有公開路徑可用） */
const COPY_DIRS = ['files', 'uploads'];
const COPY_FILES = ['ads.txt', 'robots.txt', 'humans.txt'];

/**
 * 轉址頁：不進 sitemap（noindex,follow）
 * 這些是既有公開 URL 的承接頁，共 15 個（既有站 16 個 .html 扣除 index.html 與
 * 6 個直接沿用同名路徑的內容頁）。sitemap 另以 noindex meta 為主要判準，此表為防呆。
 */
const REDIRECT_PAGES = new Set([
  'about.html',
  'contact.html',
  'sidpayfor.html',
  'automation-projects.html',
  'sidrecoilscript.html',
  'search.html',
  'aethergazer.html',
  'aethergazersemiauto.html',
  'browndust2.html',
  'browndust2-music-assist.html',
  'other-tools.html',
  'path-of-exile.html',
  'sidexilegametool.html',
  'sidexiletoolbox.html',
  'ocr-trigger-clicker.html',
]);

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function copyDir(src, dest) {
  await fs.cp(src, dest, { recursive: true, force: true });
}

async function listHtml(dir, base = '') {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      out.push(...(await listHtml(path.join(dir, e.name), rel)));
    } else if (e.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

/** 找出對應的原始檔 mtime（讓 lastmod 反映內容變動，而非每次建置時間） */
async function sourceMtime(distRel) {
  const candidates = distRel.startsWith('projects/')
    ? [path.join(SITE, 'src', 'content', 'projects', path.basename(distRel, '.html') + '.md')]
    : [path.join(SITE, 'src', 'pages', distRel.replace(/\.html$/, '.astro'))];
  let best = 0;
  for (const c of candidates) {
    try {
      const s = await fs.stat(c);
      best = Math.max(best, s.mtimeMs);
    } catch { /* 找不到就用 dist 的 mtime */ }
  }
  return best;
}

async function buildSitemap() {
  const pages = await listHtml(DIST);
  const entries = [];

  for (const rel of pages) {
    const file = path.join(DIST, rel);
    const html = await fs.readFile(file, 'utf8');

    // noindex 頁面不入 sitemap
    if (/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) continue;

    // 轉址頁不入 sitemap（以根目錄相對路徑比對，避免誤傷 projects/ 底下的同名內容頁）
    if (REDIRECT_PAGES.has(rel)) continue;

    const canon = (html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/) || [])[1];
    const loc = canon || `${SITE_URL}/${rel === 'index.html' ? '' : rel}`;

    const srcMs = await sourceMtime(rel);
    const distStat = await fs.stat(file);
    const lastmod = new Date(srcMs || distStat.mtimeMs).toISOString().slice(0, 10);

    const pri = rel === 'index.html' ? '1.0' : rel === 'projects.html' ? '0.9' : '0.7';
    entries.push({ loc, lastmod, pri });
  }

  entries.sort((a, b) => a.loc.localeCompare(b.loc));

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${xmlEscape(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${e.pri}</priority>
  </url>`
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), body, 'utf8');
  return entries.length;
}

async function run() {
  await fs.mkdir(DIST, { recursive: true });

  for (const d of COPY_DIRS) {
    const src = path.join(REPO, d);
    if (!(await fs.stat(src).catch(() => null))) continue;
    await copyDir(src, path.join(DIST, d));
    console.log(`synced ${d}/`);
  }

  for (const f of COPY_FILES) {
    const src = path.join(REPO, f);
    if (!(await fs.stat(src).catch(() => null))) continue;
    await fs.copyFile(src, path.join(DIST, f));
    console.log(`synced ${f}`);
  }

  const n = await buildSitemap();
  console.log(`wrote dist/sitemap.xml (${n} urls)`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
