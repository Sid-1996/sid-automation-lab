// Find all referenced uploads paths in *.html and report missing ones.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function run() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.html'));
  const missing = [];
  const seen = new Set();
  const REF = /(?:src|href|url)\s*=\s*"([^"]+)"/gi;
  for (const ent of files) {
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    let m;
    while ((m = REF.exec(raw))) {
      const ref = m[1];
      if (!ref.startsWith('uploads/')) continue;
      // Strip querystring
      const cleanRef = ref.split('?')[0];
      // Decode HTML entities (e.g. %E7...)
      let decoded;
      try { decoded = decodeURIComponent(cleanRef); } catch { decoded = cleanRef; }
      const key = decoded.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      // Resolve candidate paths (must include the file or directory)
      const candidates = [
        path.join(ROOT, decoded),
        path.join(ROOT, cleanRef)
      ];
      let ok = false;
      for (const c of candidates) {
        if (await fileExists(c)) { ok = true; break; }
      }
      if (!ok) missing.push({ from: ent.name, ref });
    }
  }
  console.log(`missing ${missing.length} file reference(s):`);
  for (const m of missing) console.log(`  [${m.from}] -> ${m.ref}`);
}

run().catch(e => { console.error(e); process.exit(1); });
