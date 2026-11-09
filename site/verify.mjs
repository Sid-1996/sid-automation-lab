// site/verify.mjs
// Playwright 驗收：1440 / 1280 / 768 / 390 四視口
// 檢查：水平溢出、H1 數量、導覽/搜尋/篩選互動、行動版選單、console 錯誤、視覺一致性
//        既有 URL 轉址、SEO meta（頁型專屬 OG / canonical）
//
// 站點以 GitHub Pages「專案站」形式部署，實際掛在 /<repo>/ 之下。
// 驗收時把 dist/ 掛到 <staging>/sid-automation-lab/ 再提供服務，
// 以真實模擬正式環境的路徑前綴（不可直接以根目錄服務，否則 base 路徑不會被驗到）。
import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const SHOTS = path.join(__dirname, 'docs', 'screenshots');
const PORT = 8157;

/** base 前綴：GitHub Pages 專案站 = /sid-automation-lab */
const BASE_PATH = '/sid-automation-lab';
const BASE = `http://127.0.0.1:${PORT}${BASE_PATH}`;
/** 伺服器根（用於解析以 / 開頭的站內連結） */
const ROOT_BASE = `http://127.0.0.1:${PORT}`;

/** staging 根目錄：dist/ 會被放在 <STAGE>/sid-automation-lab/ 底下 */
const STAGE = path.join(os.tmpdir(), `sid-verify-${process.pid}`);
const STAGE_ROOT = path.join(STAGE, BASE_PATH.slice(1));


const VIEWPORTS = [
  { name: '1440', width: 1440, height: 1000 },
  { name: '1280', width: 1280, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
];

const PAGES = [
  { file: 'index.html', label: 'home' },
  { file: 'projects.html', label: 'projects' },
  { file: 'projects/sidallfps.html', label: 'detail' },
  { file: 'projects/poe2-toolbox.html', label: 'detail-poe2' },
  { file: 'projects/ocr-trigger-clicker.html', label: 'detail-ocr' },
  { file: 'projects/aethergazer-semiauto.html', label: 'detail-aether' },
  { file: 'projects/browndust2-music-assist.html', label: 'detail-bd2' },
  { file: 'projects/wuthering-waves-calculator.html', label: 'detail-ww' },
  { file: 'sponsor.html', label: 'sponsor' },
  { file: 'license.html', label: 'license' },
];

/** 既有公開 URL 的轉址頁（Q4 / Q17 凍結的 URL 策略）：正式站 16 個 .html 全部有對應 */
const REDIRECTS = [
  { file: 'about.html', label: 'about', to: '/index.html#principle' },
  { file: 'contact.html', label: 'contact', to: '/index.html#contact' },
  { file: 'sidpayfor.html', label: 'sidpayfor', to: '/license.html' },
  { file: 'automation-projects.html', label: 'automation-projects', to: '/projects.html' },
  { file: 'sidrecoilscript.html', label: 'sidrecoilscript', to: '/projects/sidallfps.html' },
  { file: 'search.html', label: 'search', to: '/projects.html', query: '?q=%E5%A3%93%E6%A7%8D' },
  { file: 'aethergazer.html', label: 'aethergazer', to: '/projects/aethergazer-semiauto.html' },
  { file: 'aethergazersemiauto.html', label: 'aethergazersemiauto', to: '/projects/aethergazer-semiauto.html' },
  { file: 'browndust2.html', label: 'browndust2', to: '/projects/browndust2-music-assist.html' },
  { file: 'browndust2-music-assist.html', label: 'browndust2-music-assist', to: '/projects/browndust2-music-assist.html' },
  { file: 'other-tools.html', label: 'other-tools', to: '/projects.html#external-tools' },
  { file: 'path-of-exile.html', label: 'path-of-exile', to: '/projects/poe2-toolbox.html' },
  { file: 'sidexilegametool.html', label: 'sidexilegametool', to: '/projects/poe2-toolbox.html' },
  { file: 'sidexiletoolbox.html', label: 'sidexiletoolbox', to: '/projects/poe2-toolbox.html' },
  // 站外轉址：OCR Trigger Clicker 已搬遷到獨立站
  { file: 'ocr-trigger-clicker.html', label: 'ocr-trigger-clicker', to: 'https://sid-1996.github.io/ocr-trigger-clicker/', external: true },
];

await fs.mkdir(SHOTS, { recursive: true });

// --- 建立 staging：把 dist/ 掛到 <staging>/sid-automation-lab/ ---
await fs.rm(STAGE, { recursive: true, force: true });
await fs.mkdir(STAGE_ROOT, { recursive: true });
await fs.cp(DIST, STAGE_ROOT, { recursive: true });

// --- 啟動靜態伺服器（服務 staging 根目錄）---
const server = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
  cwd: STAGE, stdio: 'ignore',
});
const ready = async () => {
  const start = Date.now();
  while (Date.now() - start < 8000) {
    const ok = await new Promise((res) => {
      const req = http.get(`${BASE}/index.html`, { timeout: 2000 }, (r) => { r.resume(); res(r.statusCode === 200); });
      req.on('error', () => res(false));
      req.on('timeout', () => { req.destroy(); res(false); });
    });
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
};
if (!(await ready())) { console.error('server start failed'); server.kill(); process.exit(1); }

const browser = await chromium.launch({ headless: true });
let failures = 0;
const results = [];

function check(name, ok, extra = '') {
  if (!ok) failures++;
  results.push({ name, ok });
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  return ok;
}

/** 非失敗的觀察結果（例如站外 CDN 圖片的載入狀況），不影響總判定 */
function note(name, ok, extra = '') {
  console.log(`   ${ok ? 'PASS' : 'WARN'}  ${name}${extra ? ' — ' + extra : ''}`);
  return ok;
}

/** 從「顯示 N / M 個專案」取出 N */
function shownCount(text) {
  const m = String(text).match(/(\d+)\s*\/\s*(\d+)/);
  return m ? parseInt(m[1], 10) : NaN;
}

// ============ 1. 四視口 × 全部頁面：溢出 / H1 / console / 截圖 ============
console.log('\n=== A. 版面量測（4 視口 × 7 頁）===');
for (const p of PAGES) {
  console.log(`\n[${p.label}] ${p.file}`);
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

    await page.goto(`${BASE}/${p.file}`, { waitUntil: 'load' });
    await page.waitForTimeout(350);

    // 先捲到底再回頂，觸發 loading="lazy" 圖片載入，
    // 否則 fullPage 截圖會拍到未載入的空白圖框
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);

    // 等所有 <img> 結算（站外 CDN 圖片需要時間；最多等 8 秒）
    await page.evaluate(async () => {
      const imgs = Array.from(document.images).filter((i) => !i.complete);
      await Promise.all(
        imgs.map((img) =>
          new Promise((res) => {
            const done = () => res();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            setTimeout(done, 8000);
          })
        )
      );
    });
    await page.waitForTimeout(200);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const h1 = await page.evaluate(() => document.querySelectorAll('h1').length);
    const title = await page.title();

    // 確認所有 <img> 確實有載入（naturalWidth > 0），避免拍到空框
    // 站外 CDN 圖片（ECPay / PayPal）只做觀察，不判定失敗
    const imgState = await page.evaluate(() =>
      Array.from(document.images).map((i) => ({
        src: i.getAttribute('src') || '',
        broken: !i.complete || i.naturalWidth === 0,
      }))
    );
    const localBroken = imgState.filter((i) => i.broken && i.src.startsWith('/'));
    const remoteBroken = imgState.filter((i) => i.broken && !i.src.startsWith('/'));

    const out = path.join(SHOTS, `${p.label}-${vp.name}.png`);
    await page.screenshot({ path: out, fullPage: true });

    const okOverflow = check(`${vp.name}px 水平溢出 = 0`, overflow === 0, `overflow=${overflow}`);
    const okH1 = check(`${vp.name}px H1 恰為 1`, h1 === 1, `h1=${h1}`);
    const okErr = check(`${vp.name}px 無 console 錯誤`, errs.length === 0, errs.slice(0, 2).join(' | '));
    const okTitle = check(`${vp.name}px <title> 非空`, !!title, title);
    const okImg = check(`${vp.name}px 站內圖片全部載入成功`, localBroken.length === 0, localBroken.map((i) => i.src).slice(0, 3).join(', '));
    note(`${vp.name}px 站外 CDN 圖片載入`, remoteBroken.length === 0, remoteBroken.length ? remoteBroken.map((i) => i.src).slice(0, 3).join(', ') : '無站外圖片');

    results.push({ page: p.label, vp: vp.name, overflow, h1, errs: errs.length, title, brokenImgs: localBroken.length + remoteBroken.length });
    if (!okOverflow || !okH1 || !okErr || !okTitle || !okImg) { /* 已在上面列印 */ }
    await ctx.close();
  }
}

// ============ 2. 專案列表頁互動 ============
console.log('\n=== B. 專案列表互動（1440px / 390px）===');
for (const vp of [{ name: '1440', width: 1440, height: 1000 }, { name: '390', width: 390, height: 844 }]) {
  console.log(`\n[${vp.name}px]`);
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

  await page.goto(`${BASE}/projects.html`, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const countEl = page.locator('[data-count]');
  const rows = page.locator('[data-list] [data-category]');
  const total = await rows.count();

  const before = (await countEl.textContent()).trim();
  check('初始顯示 6 個專案', before.includes(`6 / ${total}`), before);

  // 分類篩選
  await page.locator('.chip[data-category="battle"]').click();
  await page.waitForTimeout(200);
  const afterCat = (await countEl.textContent()).trim();
  const visibleAfterCat = await page.locator('[data-list] [data-category]:not([hidden])').count();
  check('分類篩選（戰鬥）縮小結果', afterCat !== before, `${before} -> ${afterCat}`);
  check('分類篩選後計數 = 可見數', shownCount(afterCat) === visibleAfterCat, `visible=${visibleAfterCat} count=${afterCat}`);

  // 技術篩選疊加（battle = 流亡黯道2(python) + 深空之眼(ahk)）
  await page.locator('.chip[data-tech="ahk"]').click();
  await page.waitForTimeout(200);
  const afterTech = (await countEl.textContent()).trim();
  const visibleAfterTech = await page.locator('[data-list] [data-category]:not([hidden])').count();
  check('技術篩選可與分類疊加', shownCount(afterTech) === visibleAfterTech && visibleAfterTech === 1, `${afterCat} -> ${afterTech} visible=${visibleAfterTech}`);

  // URL 同步
  const url = page.url();
  check('篩選狀態同步到 URL', url.includes('category=battle') && url.includes('tech=ahk'), url.replace(BASE, ''));

  // 搜尋
  await page.locator('[data-reset]').click();
  await page.waitForTimeout(200);
  check('重設回到全部', (await countEl.textContent()).trim() === before);

  await page.locator('[data-search]').fill('壓槍');
  await page.waitForTimeout(250);
  const afterSearch = (await countEl.textContent()).trim();
  const visibleSearch = await page.locator('[data-list] [data-category]:not([hidden])').count();
  check('搜尋可縮小結果', shownCount(afterSearch) === 1, `${afterSearch}`);
  check('搜尋後計數 = 可見數', shownCount(afterSearch) === visibleSearch, `visible=${visibleSearch}`);

  await page.locator('[data-search]').fill('zzzznotexist');
  await page.waitForTimeout(250);
  const emptyVisible = await page.locator('[data-empty]').isVisible();
  check('搜尋無結果顯示空狀態', emptyVisible);

  // 點擊進入詳細頁
  await page.locator('[data-search]').fill('');
  await page.waitForTimeout(200);
  await page.locator('[data-list] [data-category]:not([hidden]) h3 a').first().click();
  await page.waitForLoadState('load');
  const detailH1 = await page.evaluate(() => document.querySelectorAll('h1').length);
  check('由列表進入詳細頁且 H1 = 1', detailH1 === 1, `url=${page.url().replace(BASE, '')}`);

  check('列表頁無 JS 錯誤', errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ============ 3. 行動版選單 ============
console.log('\n=== C. 行動版選單（390px / 768px）===');
for (const vp of [{ name: '390', width: 390, height: 844 }, { name: '768', width: 768, height: 1024 }]) {
  console.log(`\n[${vp.name}px]`);
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(300);

  const burger = page.locator('[data-menu-toggle]');
  const visible = await burger.isVisible();
  check(`${vp.name}px 顯示選單鈕`, visible);

  if (visible) {
    await burger.click();
    await page.waitForTimeout(250);
    const expanded = await burger.getAttribute('aria-expanded');
    const navVisible = await page.locator('[data-mobile-nav]').isVisible();
    check(`${vp.name}px 選單展開 aria-expanded=true`, expanded === 'true');
    check(`${vp.name}px 選單展開後可見`, navVisible);

    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
    const closed = await burger.getAttribute('aria-expanded');
    check(`${vp.name}px Esc 關閉選單`, closed === 'false');
  }
  check(`${vp.name}px 無 JS 錯誤`, errs.length === 0, errs.slice(0, 2).join(' | '));
  await ctx.close();
}

// ============ 4. 視覺一致性（全頁共用 Header/Footer）============
console.log('\n=== D. 全頁視覺一致性 ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  const sigs = [];
  for (const p of PAGES) {
    await page.goto(`${BASE}/${p.file}`, { waitUntil: 'load' });
    await page.waitForTimeout(250);
    const sig = await page.evaluate(() => {
      const h = document.querySelector('.hdr');
      const f = document.querySelector('.footer');
      const cs = h ? getComputedStyle(h) : null;
      return {
        headerHeight: h ? Math.round(h.getBoundingClientRect().height) : 0,
        headerBorder: cs ? cs.borderBottomColor : '',
        headerBg: cs ? cs.backgroundColor : '',
        footerBorder: f ? getComputedStyle(f).borderTopColor : '',
        footerPresent: !!f,
        tokens: getComputedStyle(document.documentElement).getPropertyValue('--signal').trim(),
      };
    });
    sigs.push({ label: p.label, ...sig });
  }
  const hs = new Set(sigs.map((s) => `${s.headerHeight}|${s.headerBorder}|${s.headerBg}`));
  const fs = new Set(sigs.map((s) => `${s.footerBorder}|${s.footerPresent}`));
  const ts = new Set(sigs.map((s) => s.tokens));
  check('全頁 Header 樣式一致', hs.size === 1, JSON.stringify(sigs.map((s) => s.headerHeight)));
  check('全頁 Footer 樣式一致', fs.size === 1);
  check('全頁 Design Token 一致', ts.size === 1, [...ts].join(','));
  await ctx.close();
}

// ============ 5. 導覽列完整性（新增項目後的排版安全）============
console.log('\n=== E. 導覽列與連結完整性 ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(250);

  const nav = await page.evaluate(() => {
    const links = [...document.querySelectorAll('.hdr__nav .hdr__link')];
    const nav = document.querySelector('.hdr__nav');
    const last = links[links.length - 1];
    const tools = document.querySelector('.hdr__tools');
    return {
      count: links.length,
      labels: links.map((a) => a.textContent.replace(/\s+/g, ' ').trim()),
      navRight: nav ? Math.round(nav.getBoundingClientRect().right) : 0,
      lastRight: last ? Math.round(last.getBoundingClientRect().right) : 0,
      toolsLeft: tools ? Math.round(tools.getBoundingClientRect().left) : 0,
      docWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  check('1024px 導覽項目數 = 5', nav.count === 5, `${nav.count} 項：${nav.labels.join(' / ')}`);
  check('1024px 導覽與工具列不重疊', nav.lastRight <= nav.toolsLeft, `nav.end=${nav.lastRight} tools.start=${nav.toolsLeft}`);
  check('1024px 無水平溢出', nav.scrollWidth <= nav.docWidth, `scroll=${nav.scrollWidth} doc=${nav.docWidth}`);

  // 內部連結不得指向不存在的頁面
  const broken = [];
  for (const p of [...PAGES, ...REDIRECTS]) {
    await page.goto(`${BASE}/${p.file}`, { waitUntil: 'load' });
    await page.waitForTimeout(120);
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h && h.startsWith('/') && !h.startsWith('//'))
    );
    for (const h of new Set(hrefs)) {
      const target = h.split('#')[0];
      if (!target) continue;
      const res = await page.request.get(`${ROOT_BASE}${target}`);
      if (!res.ok()) broken.push(`${p.file} → ${h} (${res.status()})`);
    }
  }
  check('所有站內連結皆可解析（無 404）', broken.length === 0, broken.slice(0, 4).join(' | '));
  await ctx.close();
}

// ============ 6. 既有 URL 轉址策略（Q4 / Q17）============
console.log('\n=== F. 既有 URL 轉址 ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  for (const r of REDIRECTS) {
    // 直接抓原始 HTML 檢查轉址頁的靜態標記
    // （meta refresh 是瀏覽器功能，即使關閉 JS 也會自動導向，不能用頁面 DOM 檢查）
    const raw = await (await page.request.get(`${BASE}/${r.file}${r.query || ''}`)).text();
    const m = (re) => (raw.match(re) || [])[1] || '';
    const meta = {
      refresh: m(/<meta\s+http-equiv="refresh"\s+content="([^"]*)"/),
      canonical: m(/<link\s+rel="canonical"\s+href="([^"]*)"/),
      robots: m(/<meta\s+name="robots"\s+content="([^"]*)"/),
      h1: (raw.match(/<h1[\s>]/g) || []).length,
    };

    check(`${r.file} meta refresh 指向 ${r.to}`, meta.refresh.includes(r.to), meta.refresh);
    if (r.external) {
      check(`${r.file} canonical 指向站外目標`, meta.canonical === r.to, meta.canonical);
    } else {
      check(
        `${r.file} canonical 指向目標頁`,
        meta.canonical.endsWith(r.to.split('#')[0]),
        meta.canonical
      );
    }
    check(`${r.file} noindex,follow`, /noindex/.test(meta.robots), meta.robots);
    check(`${r.file} 轉址頁不需 H1`, meta.h1 === 0, `h1=${meta.h1}`);

    // 實際導向：JS location.replace 應把瀏覽器帶到目標頁
    await page.goto(`${BASE}/${r.file}${r.query || ''}`, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    const landed = new URL(page.url());

    if (r.external) {
      check(
        `${r.file} 實際導向站外目標`,
        landed.origin + landed.pathname === new URL(r.to).origin + new URL(r.to).pathname,
        `landed=${landed.origin}${landed.pathname}`
      );
      const res = await page.request.get(r.to);
      check(`${r.file} 站外目標可取得`, res.ok(), `${res.status()} ${r.to}`);
      continue;
    }

    const expectPath = BASE_PATH + r.to.split('#')[0];
    const expectSearch = r.query || '';
    const expectHash = r.to.includes('#') ? '#' + r.to.split('#')[1] : '';
    check(
      `${r.file} 實際導向目標頁`,
      landed.pathname === expectPath &&
        landed.search === expectSearch &&
        landed.hash === expectHash,
      `landed=${landed.pathname}${landed.search}${landed.hash} expected=${expectPath}${expectSearch}${expectHash}`
    );

    // 目標頁本身必須可正常開啟且有且只有一個 H1
    await page.goto(`${BASE}${r.to.split('#')[0]}`, { waitUntil: 'load' });
    await page.waitForTimeout(200);
    const th1 = await page.evaluate(() => document.querySelectorAll('h1').length);
    check(`${r.file} 目標頁 H1 = 1`, th1 === 1, `h1=${th1}`);
  }
  await ctx.close();
}

// ============ 7. SEO meta（頁型專屬 OG、canonical）============
console.log('\n=== G. SEO meta ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // 決策 Q10：每種頁型各一張 OG
  const OG_EXPECT = {
    'index.html': 'og-home.png',
    'projects.html': 'og-projects.png',
    'sponsor.html': 'og-sponsor.png',
    'license.html': 'og-license.png',
  };
  const OG_DETAIL = 'og-detail.png';

  for (const p of PAGES) {
    const raw = await (await page.request.get(`${BASE}/${p.file}`)).text();
    const og = (raw.match(/<meta\s+property="og:image"\s+content="([^"]*)"/) || [])[1] || '';
    const canon = (raw.match(/<link\s+rel="canonical"\s+href="([^"]*)"/) || [])[1] || '';
    const title = (raw.match(/<title>([^<]*)<\/title>/) || [])[1] || '';

    const expectOg = OG_EXPECT[p.file] || (p.file.startsWith('projects/') ? OG_DETAIL : '');
    check(`${p.file} og:image 為頁型專屬圖（${expectOg}）`, og.endsWith(expectOg), og);
    check(`${p.file} canonical 指向自身`, canon.endsWith(`/${p.file}`), canon);
    check(`${p.file} title 非空`, title.trim().length > 0, title);

    // og:image 必須真的抓得到（og 為正式站絕對網址，驗證時改抓本機 dist/ 的同一路徑）
    const ogPath = og.replace('https://sid-1996.github.io/sid-automation-lab', '');
    const res = await page.request.get(`${BASE}${ogPath}`);
    check(`${p.file} og:image 可取得`, res.ok(), `${res.status()} ${ogPath}`);
  }
  await ctx.close();
}

// ============ 8. 錨點深層連結（fragment 不得被洗掉）============
// 轉址策略有 3 個帶錨點的目標：index.html#principle、index.html#contact、projects.html#external-tools。
// 舊版 site.js 的 syncUrl() 只用 pathname+query 重建 URL，會在載入時把 fragment 洗掉，
// 導致訪客落到頁面頂端而非目標區塊。這裡鎖住回歸。
console.log('\n=== H. 錨點深層連結 ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const ANCHORS = [
    { file: 'index.html', hash: '#principle' },
    { file: 'index.html', hash: '#contact' },
    { file: 'projects.html', hash: '#external-tools' },
  ];

  for (const a of ANCHORS) {
    await page.goto(`${BASE}/${a.file}${a.hash}`, { waitUntil: 'load' });

    // 站內使用 scroll-behavior: smooth，平滑捲動尚未結束時元素位置會持續變動。
    // 因此等待 scrollY 連續穩定後再判定，避免誤判。
    let last = -1;
    let stable = 0;
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(100);
      const y = await page.evaluate(() => Math.round(window.scrollY));
      if (y === last) {
        stable++;
        if (stable >= 3) break;
      } else {
        stable = 0;
        last = y;
      }
    }

    const kept = new URL(page.url()).hash === a.hash;
    check(`${a.file}${a.hash} fragment 載入後保留`, kept, page.url().replace(BASE, ''));

    const info = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { exists: false };
      const r = el.getBoundingClientRect();
      return { exists: true, top: Math.round(r.top), inView: r.top < window.innerHeight && r.bottom > 0 };
    }, a.hash);
    check(`${a.file}${a.hash} 目標元素存在`, info.exists, JSON.stringify(info));
    check(`${a.file}${a.hash} 目標元素捲入畫面`, info.exists && info.inView, JSON.stringify(info));
  }
  await ctx.close();
}

// ============ 9. sitemap / robots.txt ============
console.log('\n=== I. sitemap 與 robots.txt ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const xml = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  check('sitemap.xml 可取得', locs.length > 0, `${locs.length} urls`);
  check('sitemap 網址數 = 內容頁數（10）', locs.length === PAGES.length, `${locs.length} vs ${PAGES.length}`);

  // 轉址頁不得出現在 sitemap（以根目錄相對路徑完整比對，
  // 不可用 endsWith，否則 projects/browndust2-music-assist.html 這類同名內容頁會被誤判）
  const siteRoot = 'https://sid-1996.github.io/sid-automation-lab/';
  const redirectLocs = locs.filter((l) => REDIRECTS.some((r) => l.replace(siteRoot, '') === r.file));
  check('sitemap 不含轉址頁', redirectLocs.length === 0, redirectLocs.join(', '));

  // 每筆 loc 都要有對應頁面，且該頁 canonical 與 loc 一致
  let mismatch = [];
  let missing = [];
  for (const loc of locs) {
    const rel = loc.replace('https://sid-1996.github.io/sid-automation-lab/', '');
    const res = await page.request.get(`${BASE}/${rel}`);
    if (!res.ok()) { missing.push(rel); continue; }
    const html = await res.text();
    const canon = (html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/) || [])[1] || '';
    if (canon !== loc) mismatch.push(`${rel} -> ${canon}`);
  }
  check('sitemap 每筆網址皆可取得', missing.length === 0, missing.join(', '));
  check('sitemap loc 與頁面 canonical 一致', mismatch.length === 0, mismatch.join(' | '));

  // robots.txt 必須指向正確的 sitemap
  const robots = await (await page.request.get(`${BASE}/robots.txt`)).text();
  check(
    'robots.txt 指向 sitemap.xml',
    /sitemap:\s*https:\/\/sid-1996\.github\.io\/sid-automation-lab\/sitemap\.xml/i.test(robots),
    robots.split('\n').filter((l) => /sitemap/i.test(l)).join(' ')
  );

  // ads.txt 必須保留（AdSense 驗證）
  const ads = await page.request.get(`${BASE}/ads.txt`);
  check('ads.txt 可取得', ads.ok(), `${ads.status()}`);
  await ctx.close();
}

await browser.close();
server.kill();

console.log('\n' + '='.repeat(60));
const passCount = results.filter((r) => r.ok).length;
console.log(
  failures === 0
    ? `ALL PASS（${passCount} 項檢查全數通過）`
    : `${failures} FAILURE(S)（PASS=${passCount} / TOTAL=${results.length}）`
);
console.log('='.repeat(60));
process.exit(failures === 0 ? 0 : 1);
