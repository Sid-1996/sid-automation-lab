(function () {
  'use strict';

  var style = document.createElement('style');
  style.textContent = [
    '#nav .wsite-menu-item-wrap, #nav .wsite-menu-subitem-wrap { position: relative; }',
    '#nav .wsite-menu-wrap { position: absolute; top: 100%; left: 0; z-index: 1000; min-width: 180px; background: rgba(0,0,0,0.92); display: none !important; }',
    '#navigation.stuck #nav .wsite-menu-wrap { background: #000; }',
    '#nav .wsite-menu-item-wrap:hover > .wsite-menu-wrap, #nav .wsite-menu-subitem-wrap:hover > .wsite-menu-wrap { display: block !important; }',
    '#nav .wsite-menu-wrap .wsite-menu-wrap { top: 0; left: 100%; }',
    '#nav .wsite-menu-wrap li a { padding: 10px 18px !important; }',
    '#nav .wsite-menu-arrow:before { right: 10px; }',
    '#navmobile .wsite-menu-wrap { display: none; }',
    '#navmobile .wsite-menu-wrap.open { display: block; }',
    '#navmobile .wsite-menu-back-item { border-top: 1px solid rgba(255,255,255,0.08); margin-top: 6px; }',
    '#navmobile .wsite-menu-back-item a, #navmobile .wsite-menu-master-item a { color: #d4b49a; }',
    '#navmobile .wsite-menu-subitem-wrap { padding-left: 16px; }',
  ].join('\n');
  document.head.appendChild(style);

  function qs(s, ctx) { return (ctx || document).querySelector(s); }
  function qsa(s, ctx) { return (ctx || document).querySelectorAll(s); }

  function hasSubmenu(el) {
    if (!el) return false;
    var link = el.querySelector('.wsite-menu-item, .wsite-menu-subitem');
    return link && !link.getAttribute('href');
  }

  function toggleSubmenu(item) {
    var wrap = item.querySelector('.wsite-menu-wrap');
    if (!wrap) return;
    var isOpen = wrap.classList.contains('open');
    closeAllSubmenus(item.closest('.wsite-mobile-menu') || item.closest('#navmobile'));
    if (!isOpen) {
      wrap.classList.add('open');
      var back = wrap.querySelector('.wsite-menu-back-item');
      if (back) setTimeout(function () { back.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
    }
  }

  function closeAllSubmenus(container) {
    if (!container) return;
    var open = container.querySelectorAll('.wsite-menu-wrap.open');
    for (var i = 0; i < open.length; i++) open[i].classList.remove('open');
  }

  function setupStickyNav() {
    var nav = document.getElementById('navigation');
    if (!nav) return;
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    nav.parentNode.insertBefore(sentinel, nav);
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  function setupHamburger() {
    var btn = document.getElementById('mobile');
    var nav = document.getElementById('navigation');
    if (!btn || !nav) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      nav.classList.toggle('expanded');
      var wrap = document.getElementById('navigation-wrap');
      if (!wrap) return;
      wrap.style.maxHeight = nav.classList.contains('expanded') ? window.innerHeight - 50 + 'px' : '0px';
    });
  }

  function setupSearchToggle() {
    var btn = qs('#sitesearch .wsite-search-button');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var form = document.getElementById('wsite-header-search-form');
      if (!form) return;
      form.classList.toggle('expanded');
      var s = document.getElementById('sitesearch');
      if (s) s.classList.toggle('loaded');
      if (form.classList.contains('expanded')) {
        var inp = form.querySelector('.wsite-search-input');
        if (inp) inp.focus();
      }
    });
  }

  function setupDesktopTouch() {
    var items = qsa('#nav .wsite-menu-item-wrap, #nav .wsite-menu-subitem-wrap');
    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var link = item.querySelector('.wsite-menu-item, .wsite-menu-subitem');
        if (!link || link.getAttribute('href')) return;
        var wrap = item.querySelector('.wsite-menu-wrap');
        if (!wrap) return;
        link.addEventListener('click', function (e) {
          if (window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 992)) {
            e.preventDefault();
            var isBlock = wrap.style.display === 'block';
            qsa('#nav .wsite-menu-wrap').forEach(function (w) { w.style.display = 'none'; });
            wrap.style.display = isBlock ? 'none' : 'block';
          }
        });
      })(items[i]);
    }
  }

  function setupMobileNav() {
    var navmobile = document.getElementById('navmobile');
    if (!navmobile) return;
    var menu = navmobile.querySelector('.wsite-menu-default');
    if (!menu || menu.parentElement.classList.contains('wsite-mobile-menu')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'wsite-mobile-menu';
    menu.parentNode.insertBefore(wrapper, menu);
    wrapper.appendChild(menu);

    var submenus = qsa('.wsite-menu-wrap', navmobile);
    for (var i = 0; i < submenus.length; i++) {
      (function (sub) {
        var ul = sub.querySelector('.wsite-menu');
        if (!ul) return;

        var backLi = document.createElement('li');
        backLi.className = 'wsite-menu-back-item';
        backLi.innerHTML = '<a><span class="wsite-menu-mobile-arrow"></span><span class="wsite-menu-back">返回</span></a>';
        backLi.addEventListener('click', function (e) {
          e.stopPropagation();
          sub.classList.remove('open');
        });
        ul.insertBefore(backLi, ul.firstChild);

        var parentItem = sub.closest('.wsite-menu-item-wrap, .wsite-menu-subitem-wrap');
        if (parentItem) {
          var pl = parentItem.querySelector('.wsite-menu-item, .wsite-menu-subitem');
          if (pl && pl.getAttribute('href')) {
            var masterLi = document.createElement('li');
            masterLi.className = 'wsite-menu-master-item';
            var clone = pl.cloneNode(true);
            clone.addEventListener('click', function (e) {
              var h = this.getAttribute('href');
              if (h) window.location = h;
            });
            masterLi.appendChild(clone);
            ul.insertBefore(masterLi, backLi.nextSibling);
          }
          if (pl) {
            pl.addEventListener('click', function (e) {
              if (window.innerWidth < 768) {
                e.preventDefault();
                toggleSubmenu(parentItem);
              }
            });
          }
        }
      })(submenus[i]);
    }
  }

  function highlightCurrentPage() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    var links = qsa('#nav a[href], #navmobile a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === page) {
        var li = links[i].closest('.wsite-menu-item-wrap, .wsite-menu-subitem-wrap');
        if (li) {
          li.id = 'active';
          li.classList.add('wsite-nav-current');
        }
      }
    }
  }

  function init() {
    setupStickyNav();
    setupHamburger();
    setupSearchToggle();
    setupDesktopTouch();
    setupMobileNav();
    highlightCurrentPage();
    document.body.classList.add('postload');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
