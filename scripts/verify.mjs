import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.TEST_PORT || '8080', 10);
const BASE = `http://127.0.0.1:${PORT}`;

const SEARCH_FILE = 'search.html';
const SLIDESHOW_PAGES = new Set(['sidrecoilscript.html']);

const linkStatusCache = new Map();

function httpGetStatus(url) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 5000 }, res => {
      res.resume();
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

async function waitForServer(maxWait = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await httpGetStatus(`${BASE}/index.html`);
      if (res === 200) return;
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error(`Server did not start within ${maxWait}ms`);
}

async function run() {
  console.log('Starting local HTTP server...');
  const server = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', d => process.stdout.write('[server] ' + d));
  server.stderr.on('data', d => process.stderr.write('[server] ' + d));

  let serverExited = false;
  server.on('exit', () => { serverExited = true; });

  try {
    await waitForServer();
    console.log(`Server ready at ${BASE}\n`);
  } catch (e) {
    console.error('Failed to start server:', e.message);
    server.kill();
    process.exit(1);
  }

  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const htmlFiles = entries
    .filter(e => e.isFile() && e.name.endsWith('.html'))
    .map(e => e.name)
    .sort();

  console.log(`Found ${htmlFiles.length} HTML pages\n`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const file of htmlFiles) {
    const result = await testPage(browser, file);
    results.push(result);
    const icon = result.passed ? '\u2713' : '\u2717';
    console.log(`  ${icon} ${file.padEnd(50)} ${result.passed ? 'OK' : result.issues.length + ' issue(s)'} (${result.loadTime}ms)`);
    for (const issue of result.issues) {
      console.log(`        - ${issue}`);
    }
  }

  await browser.close();
  if (!serverExited) server.kill();
  printReport(results, htmlFiles.length);
}

async function testPage(browser, file) {
  const context = await browser.newContext();
  const page = await context.newPage();

  const issues = [];
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('response', response => {
    const status = response.status();
    if (status >= 400) networkErrors.push(`${status} ${response.url()}`);
  });

  const startTime = Date.now();
  try {
    await page.goto(`${BASE}/${file}`, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    issues.push(`Navigation: ${e.message.slice(0, 200)}`);
    await context.close();
    return { file, passed: false, issues, loadTime: Date.now() - startTime, benignCount: 0 };
  }
  const loadTime = Date.now() - startTime;

  const benignPatterns = [
    'masthead-search.png',
    'dailymotion.com',
    'report-only Content Security Policy',
    'net::ERR_FAILED',
    'header.jpg',
    'status of 404',
  ];

  function isBenign(msg) {
    return benignPatterns.some(p => msg.includes(p));
  }

  const realConsoleErrors = consoleErrors.filter(e => !isBenign(e));
  const realNetworkErrors = networkErrors.filter(e => !isBenign(e));
  const benignConsoleErrors = consoleErrors.filter(e => isBenign(e));
  const benignNetworkErrors = networkErrors.filter(e => isBenign(e));

  if (realConsoleErrors.length > 0) {
    for (const err of realConsoleErrors.slice(0, 5)) {
      issues.push(`Console error: ${err.slice(0, 200)}`);
    }
  }

  if (realNetworkErrors.length > 0) {
    for (const err of realNetworkErrors.slice(0, 5)) {
      issues.push(`HTTP ${err.slice(0, 200)}`);
    }
  }

  const title = await page.title();
  if (!title) issues.push('Missing <title>');

  const isSearch = file === SEARCH_FILE;

  // === SEO checks ===
    const h1 = await page.evaluate(() => document.querySelectorAll('h1').length);
    if (h1 !== 1) issues.push(`H1 count: ${h1} (expected 1)`);

    if (!isSearch) {
      const hasJsonLd = await page.evaluate(() => !!document.querySelector('script[type="application/ld+json"]'));
      if (!hasJsonLd) issues.push('Missing JSON-LD');
    }

    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    if (!htmlLang) issues.push('Missing <html lang>');
    else if (htmlLang !== 'zh-Hant') issues.push(`<html lang="${htmlLang}"> (expected zh-Hant)`);

    if (!isSearch) {
      const canonical = await page.evaluate(() => document.querySelector('link[rel="canonical"]')?.href);
      if (!canonical) issues.push('Missing canonical');

      const metaDesc = await page.evaluate(() => document.querySelector('meta[name="description"]')?.content);
      if (!metaDesc) issues.push('Missing meta description');
      else if (metaDesc.length < 80) issues.push(`Meta description too short (${metaDesc.length} chars, min 80)`);

      const ogTitle = await page.evaluate(() => document.querySelector('meta[property="og:title"]')?.content);
      if (!ogTitle) issues.push('Missing og:title');

      const ogDesc = await page.evaluate(() => document.querySelector('meta[property="og:description"]')?.content);
      if (!ogDesc) issues.push('Missing og:description');

      const ogImage = await page.evaluate(() => document.querySelector('meta[property="og:image"]')?.content);
      if (!ogImage) issues.push('Missing og:image');
      else {
        let imgUrl;
        if (ogImage.startsWith('http')) {
          const parsed = new URL(ogImage);
          if (parsed.hostname === 'sid-1996.github.io') {
            imgUrl = `${BASE}${parsed.pathname.replace(/^\/sid-automation-lab/, '') || '/'}`;
          } else {
            imgUrl = ogImage;
          }
        } else {
          imgUrl = `${BASE}/${ogImage.replace(/^\//, '')}`;
        }
        const imgStatus = await httpGetStatus(imgUrl);
        if (imgStatus !== 200) {
          issues.push(`og:image "${ogImage}" returned status ${imgStatus}`);
        }
      }

      const ogUrl = await page.evaluate(() => document.querySelector('meta[property="og:url"]')?.content);
      if (!ogUrl) issues.push('Missing og:url');

      const twitterCard = await page.evaluate(() => document.querySelector('meta[name="twitter:card"]')?.content);
      if (!twitterCard) issues.push('Missing twitter:card');
    }

  // === Image alt text audit ===
  const altExemptDomains = ['payment.ecpay.com.tw', 'paypalobjects.com'];
  const imagesMissingAlt = await page.evaluate((exemptDomains) => {
    return Array.from(document.querySelectorAll('img:not([alt]), img[alt=""]'))
      .filter(img => {
        const src = img.getAttribute('src') || '';
        if (exemptDomains.some(d => src.includes(d))) return false;
        if (img.closest('[id$="-slideshow"]')) return false;
        return true;
      })
      .map(img => img.getAttribute('src') || '(no src)');
  }, altExemptDomains);
  if (imagesMissingAlt.length > 0) {
    for (const src of imagesMissingAlt.slice(0, 5)) {
      issues.push(`Image missing alt text: ${src.slice(0, 150)}`);
    }
    if (imagesMissingAlt.length > 5) {
      issues.push(`  ... and ${imagesMissingAlt.length - 5} more images missing alt`);
    }
  }

  // === Internal link check (skip search.html) ===
  if (!isSearch) {
    const pageUrl = `${BASE}/${file}`;
    const localHosts = ['127.0.0.1', 'localhost', 'sid-1996.github.io'];

    const internalHrefs = await page.evaluate((hosts) => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.getAttribute('href'))
        .filter(href => {
          if (!href || href.startsWith('#') || href.startsWith('javascript:') ||
              href.startsWith('mailto:') || href.startsWith('tel:')) return false;
          try {
            const url = new URL(href, window.location.href);
            return hosts.includes(url.hostname);
          } catch { return false; }
        });
    }, localHosts);

    const linkPaths = [...new Set(internalHrefs)].map(href => {
      const url = new URL(href, pageUrl);
      if (url.hostname === 'sid-1996.github.io') {
        return url.pathname.replace(/^\/sid-automation-lab/, '') || '/';
      }
      return url.pathname;
    });

    for (const linkPath of linkPaths) {
      if (linkStatusCache.has(linkPath)) continue;
      const status = await httpGetStatus(`${BASE}${linkPath}`);
      linkStatusCache.set(linkPath, status);
    }

    const brokenLinks = linkPaths.filter(p => linkStatusCache.get(p) !== 200);
    if (brokenLinks.length > 0) {
      for (const link of brokenLinks.slice(0, 5)) {
        issues.push(`Broken internal link: "${link}" (status ${linkStatusCache.get(link)})`);
      }
      if (brokenLinks.length > 5) {
        issues.push(`  ... and ${brokenLinks.length - 5} more broken links`);
      }
    }
  }

  // === Slideshow check ===
  if (SLIDESHOW_PAGES.has(file)) {
    const slideDiv = await page.evaluate(() => !!document.getElementById('358574687281977932-slideshow'));
    if (!slideDiv) issues.push('Slideshow div not found');
  }

  const benignCount = benignConsoleErrors.length + benignNetworkErrors.length;

  await context.close();
  return { file, passed: issues.length === 0, issues, loadTime, benignCount };
}

function printReport(results, total) {
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed);
  const totalBenign = results.reduce((sum, r) => sum + (r.benignCount || 0), 0);

  const maxFileLen = Math.max(...results.map(r => r.file.length), 20);
  const sep = '\u2500'.repeat(maxFileLen + 32);

  console.log(`\n${sep}`);
  console.log(`  ${'Page'.padEnd(maxFileLen)}  Status     Time     Issues  Benign`);
  console.log(`${sep}`);
  for (const r of results) {
    const icon = r.passed ? '\u2713' : '\u2717';
    const status = r.passed ? 'PASS'.padEnd(7) : 'FAIL'.padEnd(7);
    const timeStr = `${r.loadTime}ms`.padEnd(7);
    const issueStr = r.passed ? ''.padStart(6) : `${r.issues.length}/`.padStart(6);
    console.log(`  ${r.file.padEnd(maxFileLen)}  ${icon} ${status} ${timeStr} ${issueStr}${String(r.benignCount).padStart(4)}`);
  }
  console.log(`${sep}`);
  console.log(`  TOTAL: ${total}  PASS: ${passed}  FAIL: ${failed.length}  Benign: ${totalBenign}`);

  if (failed.length > 0) {
    console.log(`\n  Failed pages detail:`);
    for (const r of failed) {
      console.log(`    \u2717 ${r.file}`);
      for (const issue of r.issues) {
        console.log(`        - ${issue}`);
      }
    }
    process.exit(1);
  }
  console.log(`\n  \u2713 All checks passed!`);
}

run().catch(e => { console.error(e); process.exit(1); });
