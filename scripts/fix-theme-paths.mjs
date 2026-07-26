// Fix paths pointing to theme/images/masthead-search.png — actual layout
// is files/theme/files/images/. (JS variant rules removed after Weebly
// plugins.js/custom.js/mobile.js cleanup — those files no longer exist.)
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const IMG_REWRITES = [
  ['"files/theme/images/masthead-search.png"', '"files/theme/files/images/masthead-search.png"'],
];

async function run() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.html'));
  let touched = 0;
  let repl = 0;
  for (const ent of files) {
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    let out = raw;
    let n = 0;
    for (const [from, to] of IMG_REWRITES) {
      const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = out.match(re);
      if (matches) {
        out = out.replace(re, to);
        n += matches.length;
      }
    }
    if (out !== raw) {
      await fs.writeFile(fp, out, 'utf8');
      touched++;
      repl += n;
      console.log(`${ent.name} (+${n})`);
    }
  }
  console.log(`done: ${touched} file(s), ${repl} replacement(s)`);
}

run().catch(e => { console.error(e); process.exit(1); });
