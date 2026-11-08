/* project-filter.js — automation-projects.html local filter (no backend).
   Loaded AFTER sid-nav.js / search.js; independent of Weebly header nav.
   URL params ?game=&task=&tech=&q= read on load, written on change. */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('[data-filter-reset]') : null;
    if (!trigger) return;
    var reset = document.getElementById('filter-reset');
    if (reset) reset.click();
  });
  if (window.location.hash === '#filter-q') {
    var hashInput = document.getElementById('filter-q');
    if (hashInput) hashInput.focus();
  }
  var form = document.querySelector('[data-filter-form]');
  if (!form) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var empty = document.querySelector('[data-empty]');
  var count = document.querySelector('[data-result-count]');
  var searchInput = document.getElementById('filter-q');
  var gameSel = document.getElementById('filter-game');
  var taskSel = document.getElementById('filter-task');
  var techSel = document.getElementById('filter-tech');
  var resetBtn = document.getElementById('filter-reset');
  function readParams() {
    var p = new URLSearchParams(window.location.search);
    if (searchInput) searchInput.value = p.get('q') || '';
    if (gameSel) gameSel.value = p.get('game') || '';
    if (taskSel) taskSel.value = p.get('task') || '';
    if (techSel) techSel.value = p.get('tech') || '';
  }
  function writeParams() {
    var p = new URLSearchParams();
    if (searchInput && searchInput.value.trim()) p.set('q', searchInput.value.trim());
    if (gameSel && gameSel.value) p.set('game', gameSel.value);
    if (taskSel && taskSel.value) p.set('task', taskSel.value);
    if (techSel && techSel.value) p.set('tech', techSel.value);
    var qs = p.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
  }
  function matches(card) {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var game = gameSel ? gameSel.value : '';
    var task = taskSel ? taskSel.value : '';
    var tech = techSel ? techSel.value : '';
    if (game && card.dataset.game !== game) return false;
    if (task && card.dataset.task !== task) return false;
    if (tech && (card.dataset.tech || '').split(' ').indexOf(tech) === -1) return false;
    if (q) {
      var hay = (card.dataset.search || '').toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }
  function apply() {
    var visible = 0;
    cards.forEach(function (card) {
      var ok = matches(card);
      card.hidden = !ok;
      if (ok) visible++;
    });
    if (count) count.textContent = '顯示 ' + visible + ' / ' + cards.length + ' 個專案';
    if (empty) empty.classList.toggle('show', visible === 0);
    writeParams();
  }
  [searchInput, gameSel, taskSel, techSel].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', apply);
    el.addEventListener('change', apply);
  });
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      if (gameSel) gameSel.value = '';
      if (taskSel) taskSel.value = '';
      if (techSel) techSel.value = '';
      apply();
      if (searchInput) searchInput.focus();
    });
  }
  readParams();
  apply();
})();
