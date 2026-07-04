// Add <link rel="icon" type="image/svg+xml" href="/favicon.svg"> to all HTMLs.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TAG = '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />';

async function run() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.html'));
  let touched = 0;
  for (const ent of files) {
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    if (raw.includes('rel="icon"')) continue;
    let out;
    if (/<link[^>]+rel=['\"]shortcut icon['\"]/i.test(raw)) {
      out = raw.replace(
        /<link([^>]+)rel=['\"]shortcut icon['\"]/i,
        (m) => TAG + '\n' + m
      );
    } else if (/<head[^>]*>/i.test(raw)) {
      out = raw.replace(/<head[^>]*>/i, (m) => m + '\n' + TAG);
    } else {
      out = raw.replace('<meta', TAG + '\n<meta', 1);
    }
    if (out !== raw) {
      await fs.writeFile(fp, out, 'utf8');
      touched++;
    }
  }
  console.log(`injected favicon into ${touched} file(s)`);
}

run().catch(e => { console.error(e); process.exit(1); });
