/* public/site.js —— 原型互動邏輯（Vanilla JS，無框架、無 jQuery）
   1) 行動版選單開關（含 Esc 關閉與焦點返回）
   2) 專案列表的分類 / 技術棧 / 關鍵字三重篩選（含 URL query 同步）
*/
(function () {
  'use strict';

  /* ---------- 行動版選單 ---------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function closeNav() {
    if (!toggle || !mobileNav) return;
    mobileNav.hidden = true;
    mobileNav.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '開啟選單');
  }

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) { closeNav(); return; }
      mobileNav.hidden = false;
      mobileNav.setAttribute('data-open', 'true');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '關閉選單');
    });

    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- 專案列表篩選 ---------- */
  var list = document.querySelector('[data-list]');
  if (!list) return;

  var rows = Array.prototype.slice.call(list.querySelectorAll('[data-category]'));
  var catButtons = Array.prototype.slice.call(document.querySelectorAll('[data-category].chip'));
  var techButtons = Array.prototype.slice.call(document.querySelectorAll('[data-tech]'));
  var searchInput = document.querySelector('[data-search]');
  var countEl = document.querySelector('[data-count]');
  var emptyEl = document.querySelector('[data-empty]');
  var resetBtn = document.querySelector('[data-reset]');

  var state = { category: 'all', tech: 'all', q: '' };

  function apply() {
    var q = state.q.trim().toLowerCase();
    var shown = 0;

    rows.forEach(function (row) {
      var catOk = state.category === 'all' || row.getAttribute('data-category') === state.category;
      var stack = (row.getAttribute('data-stack') || '').toLowerCase();
      var techOk = state.tech === 'all' || stack.indexOf(state.tech) !== -1;
      var hay = (row.textContent + ' ' + stack).toLowerCase();
      var qOk = !q || hay.indexOf(q) !== -1;
      var visible = catOk && techOk && qOk;
      row.hidden = !visible;
      if (visible) shown++;
    });

    if (countEl) countEl.textContent = '顯示 ' + shown + ' / ' + rows.length + ' 個專案';
    if (emptyEl) emptyEl.hidden = shown !== 0;

    syncUrl();
  }

  function syncUrl() {
    var params = new URLSearchParams();
    if (state.category !== 'all') params.set('category', state.category);
    if (state.tech !== 'all') params.set('tech', state.tech);
    if (state.q) params.set('q', state.q);
    var qs = params.toString();
    // 保留 fragment（錨點），否則 /projects.html#external-tools 這類深層連結
    // 會在頁面載入時被 replaceState 洗掉，訪客無法跳到指定區塊
    var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
    window.history.replaceState(null, '', url);
  }

  function markOn(buttons, attr, value) {
    buttons.forEach(function (b) {
      var on = b.getAttribute(attr) === value;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  catButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.category = btn.getAttribute('data-category');
      markOn(catButtons, 'data-category', state.category);
      apply();
    });
  });

  techButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.tech = btn.getAttribute('data-tech');
      markOn(techButtons, 'data-tech', state.tech);
      apply();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.q = searchInput.value;
      apply();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      state = { category: 'all', tech: 'all', q: '' };
      if (searchInput) searchInput.value = '';
      markOn(catButtons, 'data-category', 'all');
      markOn(techButtons, 'data-tech', 'all');
      apply();
    });
  }

  // 從 URL 還原初始篩選狀態（可分享連結）
  (function restoreFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var c = params.get('category');
    var t = params.get('tech');
    var q = params.get('q');
    if (c) { state.category = c; markOn(catButtons, 'data-category', c); }
    if (t) { state.tech = t; markOn(techButtons, 'data-tech', t); }
    if (q) { state.q = q; if (searchInput) searchInput.value = q; }
    apply();
  })();
})();
