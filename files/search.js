(function () {
  'use strict';
  if (window.__SID_SEARCH_LOADED__) return;
  window.__SID_SEARCH_LOADED__ = true;

  const INDEX_URL = '/search-index.json';
  const FUSE_URL = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js';

  let fuse = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error('fail: ' + src)); };
      document.head.appendChild(s);
    });
  }

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&apos;');
  }

  async function ensureFuse() {
    if (window.Fuse) return window.Fuse;
    await loadScript(FUSE_URL);
    return window.Fuse;
  }

  async function loadIndex() {
    if (fuse) return fuse;
    const Fuse = await ensureFuse();
    let pages = [];
    try {
      const res = await fetch(INDEX_URL);
      pages = await res.json();
    } catch (e) {
      pages = window.__SID_PAGES__ || [];
    }
    fuse = new Fuse(pages, {
      keys: [
        { name: 'title', weight: 0.6 },
        { name: 'keywords', weight: 0.25 },
        { name: 'snippet', weight: 0.15 }
      ],
      includeScore: true,
      threshold: 0.45,
      ignoreLocation: true,
      minMatchCharLength: 2
    });
    return fuse;
  }

  function renderPanel(host, q, hits) {
    if (!host) return;
    if (!q) { host.innerHTML = ''; return; }
    if (!hits.length) {
      host.innerHTML = '<p class="sid-search-empty">找不到與「'
        + escapeHTML(q) + '」相關的結果</p>';
      return;
    }
    host.innerHTML =
      '<p class="sid-search-count">共 ' + hits.length + ' 筆結果</p>' +
      hits.map(function (p) {
        return '<a class="sid-search-hit" href="' + escapeHTML(p.url) + '">'
          + '<span class="sid-search-title">' + escapeHTML(p.title) + '</span>'
          + '<span class="sid-search-snippet">' + escapeHTML(p.snippet || '') + '</span>'
          + '</a>';
      }).join('');
  }

  function initInline() {
    const form = document.getElementById('wsite-header-search-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const q = (input && input.value || '').trim();
      window.location.href = 'search.html?q=' + encodeURIComponent(q);
    });
    const input = form.querySelector('input[name="q"]');
    if (!input) return;
    let host = document.getElementById('sid-search-panel');
    if (!host) {
      host = document.createElement('div');
      host.id = 'sid-search-panel';
      host.className = 'sid-search-panel';
      form.parentNode.appendChild(host);
    }
    let timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      const q = input.value.trim();
      timer = setTimeout(async function () {
        try {
          await loadIndex();
          const hits = q
            ? fuse.search(q, { limit: 6 }).map(function (r) { return r.item; })
            : [];
          renderPanel(host, q, hits);
        } catch (err) {
          host.innerHTML = '<p class="sid-search-empty">搜尋引擎初始化失敗</p>';
        }
      }, 200);
    });
  }

  function initResultPage() {
    const root = document.getElementById('sid-search-results');
    if (!root) return;
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim();
    const title = document.getElementById('sid-search-title');
    if (title) title.textContent = q ? ('搜尋：「' + q + '」') : '請輸入關鍵字';
    const input = document.getElementById('sid-search-input');
    if (input) input.value = q;
    loadIndex().then(function () {
      const hits = q
        ? fuse.search(q, { limit: 30 }).map(function (r) { return r.item; })
        : [];
      renderPanel(root, q, hits);
    });
    const form = document.getElementById('sid-search-form');
    form && form.addEventListener('submit', function (e) {
      e.preventDefault();
      const v = (form.querySelector('input[name="q"]') || {}).value || '';
      window.location.href = 'search.html?q=' + encodeURIComponent(v.trim());
    });
  }

  function boot() {
    initInline();
    initResultPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
