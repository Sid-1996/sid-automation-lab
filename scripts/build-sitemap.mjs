// Generate sitemap.xml from *.html in this directory.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const BASE = process.env.SITE_BASE || 'https://sid-1996.github.io/sid-automation-lab';

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
}

async function run() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const REDIRECT_FILES = new Set([
    'search.html',
    '122982683733394226452246721229938899369382116125163.html',
    '208542018224037208552551234214.html',
    '32879320972031632773-rarr.html',
    '3325821205212703891730446.html',
    '38283303322344726088.html',
  ]);
  const files = entries
    .filter(e => e.isFile() && e.name.endsWith('.html') && !REDIRECT_FILES.has(e.name))
    .map(e => e.name);

  const stat = (await Promise.all(files.map(async f => {
    const s = await fs.stat(path.join(ROOT, f));
    return [f, s.mtime.toISOString().slice(0,10)];
  })));
  stat.sort((a, b) => a[0].localeCompare(b[0]));

  const urls = stat.map(([name, lastmod]) => {
    const loc = name === 'index.html' ? BASE + '/' : BASE + '/' + name;
    const pri = name === 'index.html' ? '1.0' : '0.7';
    return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${pri}</priority>
  </url>`;
  });
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  await fs.writeFile(path.join(ROOT, 'sitemap.xml'), body, 'utf8');
  console.log('wrote sitemap.xml (' + urls.length + ' urls)');
}

run().catch(e => { console.error(e); process.exit(1); });
