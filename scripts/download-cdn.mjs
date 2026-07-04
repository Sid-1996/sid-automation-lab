// Download all Weebly CDN assets referenced in *.html into files/cdn_local/.
// Then rewrite the HTML to point to local paths.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOCAL = path.join(ROOT, 'files', 'cdn_local');

const HOSTS = [
  'https://cdn11.editmysite.com',
  'https://cdn2.editmysite.com'
];

async function downloadOnce(url, out) {
  if (await exists(out)) {
    console.log(`  skip (cached): ${path.relative(ROOT, out)}`);
    return;
  }
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, buf);
  console.log(`  ✓ ${(buf.length/1024).toFixed(1)} KB ← ${path.relative(ROOT, out)}`);
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function fetchHeadFollowing(url, depth = 5) {
  let cur = url;
  for (let i = 0; i < depth; i++) {
    const res = await fetch(cur, { method: 'GET', redirect: 'manual' });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) break;
      cur = new URL(loc, cur).toString();
      continue;
    }
    return { res, url: cur };
  }
  return null;
}

async function fetchAndFollow(url) {
  const cur = url;
  const res = await fetch(cur, { redirect: 'follow' });
  const buf = Buffer.from(await res.arrayBuffer());
  return { res, url: cur, buf };
}

async function fetchTextOrBin(url) {
  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
  const ab = await r.arrayBuffer();
  return Buffer.from(ab);
}

async function fetchText(url) {
  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
  return r.text();
}

function localFor(url) {
  // url like https://cdn11.editmysite.com/css/sites.css?buildtime=1234
  // -> files/cdn_local/css/sites.css
  const u = new URL(url);
  let p = u.pathname;
  if (p.endsWith('/')) p += 'index';
  return path.join(LOCAL, p.replace(/^\/+/, ''));
}

function makeLocalHref(origUrl) {
  let p = new URL(origUrl).pathname;
  if (p.endsWith('/')) p += 'index';
  return 'files/cdn_local' + p;
}

async function downloadFont(cssUrl, baseUrl) {
  const cssText = await fetchText(cssUrl);
  // find @font-face src url(...) with possibly absolute or relative URL
  const urls = new Set();
  const faceRe = /@font-face\s*\{[^}]*\}/g;
  let m;
  while ((m = faceRe.exec(cssText))) {
    const block = m[0];
    const srcRe = /src\s*:\s*([^;]+);/g;
    let s;
    while ((s = srcRe.exec(block))) {
      const parts = s[1].split(',').map(x => x.trim());
      for (const part of parts) {
        const urlRe = /url\(\s*['"]?([^'")]+)['"]?\s*\)/;
        const u = urlRe.exec(part);
        if (u) urls.add(u[1]);
      }
    }
  }
  for (const urlOrPath of urls) {
    const abs = new URL(urlOrPath, baseUrl).toString();
    const out = localFor(abs);
    try {
      await downloadOnce(abs, out);
    } catch (e) {
      console.warn('  font download failed: ' + abs + ' (' + e.message + ')');
    }
  }
  // Patch CSS: replace each font URL with relative path under ../fonts/
  let patched = cssText;
  for (const urlOrPath of urls) {
    const abs = new URL(urlOrPath, baseUrl).toString();
    const localCssPath = makeLocalHref(abs);
    let cssRel = path.relative(path.dirname(makeLocalHref(cssUrl)), localCssPath).replace(/\\/g, '/');
    if (!cssRel.startsWith('.')) cssRel = './' + cssRel;
    patched = patched.split(abs).join(cssRel);
    // also replace any quoted variant
    patched = patched.split(urlOrPath).join(cssRel);
  }
  return patched;
}

async function main() {
  const ASSETS = [
    'https://cdn11.editmysite.com/css/sites.css',
    'https://cdn11.editmysite.com/css/old/fancybox.css',
    'https://cdn11.editmysite.com/css/social-icons.css',
    'https://cdn11.editmysite.com/js/jquery-1.8.3.min.js',
    'https://cdn11.editmysite.com/js/site/main.js',
    'https://cdn11.editmysite.com/js/site/main-customer-accounts-site.js',
    'https://cdn2.editmysite.com/js/lang/zh_TW/stl.js',
    // one-off files used by sidrecoilscript.html only:
    'https://cdn11.editmysite.com/css/old/slideshow/slideshow.css',
    'https://cdn11.editmysite.com/js/old/slideshow-jq.js'
  ];
  for (const f of ASSETS) {
    try { await downloadOnce(f, localFor(f)); }
    catch (e) { console.warn('fail: ' + f + ' — ' + e.message); }
  }
  // fonts (process CSS, download referenced assets, rewrite CSS)
  const fontDefs = [
    { css: 'https://cdn2.editmysite.com/fonts/Cabin/font.css',     base: 'https://cdn2.editmysite.com/fonts/Cabin/' },
    { css: 'https://cdn2.editmysite.com/fonts/Montserrat/font.css', base: 'https://cdn2.editmysite.com/fonts/Montserrat/' }
  ];
  for (const fd of fontDefs) {
    const outCss = localFor(fd.css);
    if (await exists(outCss)) {
      console.log('  font css cached, skip rewrite: ' + path.relative(ROOT, outCss));
      continue;
    }
    const patched = await downloadFont(fd.css, fd.base);
    await fs.mkdir(path.dirname(outCss), { recursive: true });
    await fs.writeFile(outCss, patched, 'utf8');
    console.log('  ✓ ' + (patched.length/1024).toFixed(1) + ' KB css (rewritten) ← ' + path.relative(ROOT, outCss));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
