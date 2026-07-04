// Rewrite links that still point to https://lelive.weebly.com/... and external www.weebly.com images
// to local equivalents.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const REWRITES = [
  // Sid recoil script 外部連結 -> 本地 sidrecoilscript.html
  ['https://lelive.weebly.com/sidrecoilscript.html', 'sidrecoilscript.html'],
  // Sid pay 外部連結 -> 本地 sidpayfor.html
  ['https://lelive.weebly.com/sidpayfor.html', 'sidpayfor.html'],
  // 外部 ZIP 下載 -> 本地檔（此 zip 在本地 uploads 內已有）
  ['https://lelive.weebly.com/uploads/7/7/0/3/77032051/safpsg_recoilcontrol_trial.zip',
   'uploads/7/7/0/3/77032051/safpsg_recoilcontrol_trial.zip'],
  // 中文檔名 zip（URL-encoded）
  ['https://lelive.weebly.com/uploads/7/7/0/3/77032051/%E7%A1%AC%E9%AB%94%E5%BA%8F%E8%99%9F%E6%9F%A5%E8%A9%A2%E5%B7%A5%E5%85%B7.zip',
   'uploads/7/7/0/3/77032051/%E7%A1%AC%E9%AB%94%E5%BA%8F%E8%99%9F%E6%9F%A5%E8%A9%A2%E5%B7%A5%E5%85%B7.zip'],
  // Weebly 內建檔案 icon -> 本地化
  ['https://www.weebly.com/weebly/images/file_icons/gz.png', 'files/file_icons/gz.png']
];

async function run() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.html'));
  let touched = 0;
  let totalRepl = 0;
  for (const ent of files) {
    const fp = path.join(ROOT, ent.name);
    const raw = await fs.readFile(fp, 'utf8');
    let out = raw;
    let count = 0;
    for (const [from, to] of REWRITES) {
      const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = out.match(re);
      if (matches) {
        out = out.replace(re, to);
        count += matches.length;
      }
    }
    if (out !== raw) {
      await fs.writeFile(fp, out, 'utf8');
      touched++;
      totalRepl += count;
      console.log(`updated ${ent.name} (${count})`);
    }
  }
  console.log(`done: ${touched} file(s), ${totalRepl} replacement(s)`);
}

run().catch(e => { console.error(e); process.exit(1); });
