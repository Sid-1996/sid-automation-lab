// Inject search.js + fuse.js loader into all *.html before </body>.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const INJECT = `<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js" defer></script>
<script src="files/search.js" defer></script>
</body>`;

async function run() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.html'));
  let touched = 0;
  for (const ent of files) {
    if (ent.name === 'search.html') continue;
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    if (raw.includes('files/search.js')) continue;
    if (!raw.includes('</body>')) {
      console.log('SKIP (no </body>): ' + ent.name);
      continue;
    }
    const out = raw.replace('</body>', INJECT);
    await fs.writeFile(fp, out, 'utf8');
    touched++;
  }
  console.log('injected into ' + touched + ' file(s)');
}

run().catch(e => { console.error(e); process.exit(1); });
