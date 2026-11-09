// site/scripts/live-check.mjs —— 線上正式站巡檢
//
// 用途：部署切換後（或每次內容更新後）對「線上正式站」做真實瀏覽器巡檢：
//   - 16 個既有公開 URL 的實際轉址結果（含 fragment 與查詢字串是否保留）
//   - 站外轉址（ocr-trigger-clicker.html）
//   - 首頁 H1、站內圖片載入、水平溢出
//   - 專案列表的分類篩選與 URL 同步
//   - 行動版選單開關與 Esc 關閉
//   - console 錯誤
//
// 用法：npm run live-check
// 依賴：playwright（由 repo 根目錄的 @playwright/mcp 帶入，site/ 不另加相依；
//       全新 clone 時需先在根目錄執行 npm install）
import { chromium } from 'playwright';

const BASE = process.env.SITE_URL
  ? process.env.SITE_URL.replace(/\/+$/, '')
  : 'https://sid-1996.github.io/sid-automation-lab';
let fail = 0;
const results = [];
function check(name, ok, extra = '') {
  if (!ok) fail++;
  results.push({ name, ok });
  console.log(`   ${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));

// 1. 轉址：既有 URL → 新目標
const REDIRECTS = [
  { from: '/about.html', to: '/sid-automation-lab/index.html', hash: '#principle' },
  { from: '/contact.html', to: '/sid-automation-lab/index.html', hash: '#contact' },
  { from: '/automation-projects.html', to: '/sid-automation-lab/projects.html', hash: '' },
  { from: '/sidrecoilscript.html', to: '/sid-automation-lab/projects/sidallfps.html', hash: '' },
  { from: '/sidpayfor.html', to: '/sid-automation-lab/license.html', hash: '' },
  { from: '/sidexilegametool.html', to: '/sid-automation-lab/projects/poe2-toolbox.html', hash: '' },
  { from: '/sidexiletoolbox.html', to: '/sid-automation-lab/projects/poe2-toolbox.html', hash: '' },
  { from: '/path-of-exile.html', to: '/sid-automation-lab/projects/poe2-toolbox.html', hash: '' },
  { from: '/aethergazer.html', to: '/sid-automation-lab/projects/aethergazer-semiauto.html', hash: '' },
  { from: '/aethergazersemiauto.html', to: '/sid-automation-lab/projects/aethergazer-semiauto.html', hash: '' },
  { from: '/browndust2.html', to: '/sid-automation-lab/projects/browndust2-music-assist.html', hash: '' },
  { from: '/browndust2-music-assist.html', to: '/sid-automation-lab/projects/browndust2-music-assist.html', hash: '' },
  { from: '/other-tools.html', to: '/sid-automation-lab/projects.html', hash: '#external-tools' },
];

for (const r of REDIRECTS) {
  await page.goto(BASE + r.from, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const u = new URL(page.url());
  const ok = u.pathname === r.to && u.hash === r.hash;
  check(`線上轉址 ${r.from}`, ok, `landed=${u.pathname}${u.hash}`);
}

// 2. search.html 保留查詢字串
await page.goto(`${BASE}/search.html?q=%E5%A3%93%E6%A7%8D`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
{
  const u = new URL(page.url());
  check('線上轉址 /search.html?q=壓槍 保留查詢字串', u.pathname === '/sid-automation-lab/projects.html' && u.search === '?q=%E5%A3%93%E6%A7%8D', `landed=${u.pathname}${u.search}`);
  const shown = await page.evaluate(() => {
    // 只算列表列（[data-list] 內的 [data-category]），篩選按鈕也有 data-category 需排除
    const rows = [...document.querySelectorAll('[data-list] [data-category]')];
    return { visible: rows.filter((r) => !r.hidden).length, total: rows.length, count: document.querySelector('[data-count]')?.textContent };
  });
  check('搜尋結果已套用篩選', shown.visible > 0 && shown.visible < shown.total, JSON.stringify(shown));
}

// 3. 站外轉址
await page.goto(`${BASE}/ocr-trigger-clicker.html`, { waitUntil: 'load' });
await page.waitForTimeout(2500);
{
  const u = new URL(page.url());
  check('線上轉址 /ocr-trigger-clicker.html → 站外', u.hostname === 'sid-1996.github.io' && u.pathname === '/ocr-trigger-clicker/', `landed=${u.origin}${u.pathname}`);
}

// 4. 首頁 H1 / console / 圖片
await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(1200);
{
  const h1 = await page.evaluate(() => document.querySelectorAll('h1').length);
  check('首頁 H1 = 1', h1 === 1, `h1=${h1}`);
  const imgs = await page.evaluate(() =>
    [...document.querySelectorAll('img')].filter((i) => i.getAttribute('src')?.startsWith('/')).map((i) => ({ src: i.getAttribute('src'), w: i.naturalWidth }))
  );
  const broken = imgs.filter((i) => i.w === 0);
  check('首頁站內圖片全部載入', broken.length === 0, JSON.stringify(broken));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('首頁無水平溢出', overflow === 0, `overflow=${overflow}`);
}

// 5. 專案列表篩選互動
await page.goto(`${BASE}/projects.html`, { waitUntil: 'load' });
await page.waitForTimeout(800);
{
  const before = await page.evaluate(() => [...document.querySelectorAll('[data-category]')].filter((r) => !r.hidden).length);
  await page.click('button.chip[data-category="battle"]');
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => [...document.querySelectorAll('[data-category]')].filter((r) => !r.hidden).length);
  const url = page.url();
  check('線上分類篩選可運作', after > 0 && after < before, `${before} → ${after}`);
  check('篩選狀態同步到 URL', url.includes('category=battle'), url);
}

// 6. 行動版選單（390px）
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mctx.newPage();
await mpage.goto(`${BASE}/index.html`, { waitUntil: 'load' });
await mpage.waitForTimeout(800);
{
  const visibleBefore = await mpage.evaluate(() => {
    const n = document.querySelector('[data-mobile-nav]');
    return n ? !n.hidden : null;
  });
  await mpage.click('[data-menu-toggle]');
  await mpage.waitForTimeout(400);
  const visibleAfter = await mpage.evaluate(() => {
    const n = document.querySelector('[data-mobile-nav]');
    return n ? !n.hidden : null;
  });
  check('線上行動版選單可開啟', visibleBefore === false && visibleAfter === true, `before=${visibleBefore} after=${visibleAfter}`);
  await mpage.keyboard.press('Escape');
  await mpage.waitForTimeout(300);
  const closed = await mpage.evaluate(() => {
    const n = document.querySelector('[data-mobile-nav]');
    return n ? n.hidden : null;
  });
  check('線上行動版選單 Esc 可關閉', closed === true, `hidden=${closed}`);
}

// 7. console 錯誤
check('無 console 錯誤', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

await browser.close();
const pass = results.filter((r) => r.ok).length;
console.log('\n' + '='.repeat(50));
console.log(fail === 0 ? `線上巡檢 ALL PASS（${pass} 項）` : `${fail} FAILURE(S)（PASS=${pass}/${results.length}）`);
console.log('='.repeat(50));
process.exit(fail === 0 ? 0 : 1);
