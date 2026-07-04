// Rewrite HTML <link> / <script src=> from Weebly CDN to local files/cdn_local/.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const REWRITES = [
  // CSS
  ['https://cdn11.editmysite.com/css/sites.css',                  'files/cdn_local/css/sites.css'],
  ['https://cdn11.editmysite.com/css/old/fancybox.css',           'files/cdn_local/css/old/fancybox.css'],
  ['https://cdn11.editmysite.com/css/social-icons.css',           'files/cdn_local/css/social-icons.css'],
  ['https://cdn11.editmysite.com/css/old/slideshow/slideshow.css','files/cdn_local/css/old/slideshow/slideshow.css'],
  ['//cdn11.editmysite.com/css/sites.css',                        'files/cdn_local/css/sites.css'],
  ['//cdn11.editmysite.com/css/old/fancybox.css',                 'files/cdn_local/css/old/fancybox.css'],
  ['//cdn11.editmysite.com/css/social-icons.css',                 'files/cdn_local/css/social-icons.css'],
  ['//cdn11.editmysite.com/css/old/slideshow/slideshow.css',      'files/cdn_local/css/old/slideshow/slideshow.css'],
  // JS
  ['https://cdn11.editmysite.com/js/jquery-1.8.3.min.js',         'files/cdn_local/js/jquery-1.8.3.min.js'],
  ['https://cdn11.editmysite.com/js/site/main.js',                'files/cdn_local/js/site/main.js'],
  ['https://cdn11.editmysite.com/js/site/main-customer-accounts-site.js', 'files/cdn_local/js/site/main-customer-accounts-site.js'],
  ['https://cdn11.editmysite.com/js/old/slideshow-jq.js',         'files/cdn_local/js/old/slideshow-jq.js'],
  ['https://cdn2.editmysite.com/js/lang/zh_TW/stl.js',            'files/cdn_local/js/lang/zh_TW/stl.js'],
  ['//cdn11.editmysite.com/js/jquery-1.8.3.min.js',               'files/cdn_local/js/jquery-1.8.3.min.js'],
  ['//cdn11.editmysite.com/js/site/main.js',                      'files/cdn_local/js/site/main.js'],
  ['//cdn2.editmysite.com/js/lang/zh_TW/stl.js',                  'files/cdn_local/js/lang/zh_TW/stl.js'],
  // Fonts
  ['https://cdn2.editmysite.com/fonts/Cabin/font.css',            'files/cdn_local/fonts/Cabin/font.css'],
  ['https://cdn2.editmysite.com/fonts/Montserrat/font.css',       'files/cdn_local/fonts/Montserrat/font.css'],
  // ASSETS_BASE runtime var (so internal chunk loads don't blank)
  ["STATIC_BASE = '//cdn1.editmysite.com/'",      "var STATIC_BASE = '';"],
  ["ASSETS_BASE = '//cdn11.editmysite.com/'",     "var ASSETS_BASE = '';"],
];

async function run() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.html'));
  let touched = 0;
  let count = 0;
  for (const ent of files) {
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    let out = raw;
    let fileChanges = 0;
    for (const [from, to] of REWRITES) {
      const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = out.match(re);
      if (matches) {
        out = out.replace(re, to);
        fileChanges += matches.length;
      }
    }
    if (out !== raw) {
      await fs.writeFile(fp, out, 'utf8');
      touched++;
      count += fileChanges;
      console.log(`${ent.name} (-${fileChanges})`);
    }
  }
  console.log(`done: ${touched} file(s), ${count} replacement(s)`);
}

run().catch(e => { console.error(e); process.exit(1); });
