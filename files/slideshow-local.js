// Minimal replacement for Weebly's wSlideshow.render used in sidrecoilscript.html.
// Instead of fetching webpack chunks from CDN, just render plain images
// with autoplay + fade transition. Parameters from the original init():
//   nav:"none", navLocation:"bottom", captionLocation:"bottom",
//   transition:"fade", autoplay:"1", speed:"3", aspectRatio:"auto",
//   showControls:"true", randomStart:"false", images:[...]
(function () {
  if (window.wSlideshow && window.wSlideshow.__sid_local__) return;
  var API = {
    __sid_local__: true,
    render: function (cfg) {
      var id = cfg.elementID;
      var host = document.getElementById(id)
        || document.getElementById(id + '-slideshow');
      if (!host) return;
      var imgs = (cfg.images || []).map(function (i) {
        var u = i.url;
        if (u && u.charAt(0) === '/') u = u.slice(1);
        while (u.indexOf('\\') !== -1) u = u.replace('\\', '/');
        // strip quotes / extra escaping
        u = u.replace(/^['\"]|['\"]$/g, '');
        return {
          url: '/uploads/' + u,
          alt: ''
        };
      });
      if (!imgs.length) return;
      var speed = Math.max(1, parseInt(cfg.speed, 10) || 3);
      var random = cfg.randomStart === 'true' || cfg.randomStart === true;
      var order = imgs.map(function (_, i) { return i; });
      if (random) {
        for (var r = order.length - 1; r > 0; r--) {
          var j = Math.floor(Math.random() * (r + 1));
          var t = order[r]; order[r] = order[j]; order[j] = t;
        }
      }
      var index = 0;
      host.className = (host.className || '') + ' sid-fade-slideshow';
      // Pick first image's intrinsic ratio for container.
      var firstImg = (cfg.images || [])[0];
      var ar = '4 / 3';
      if (firstImg && firstImg.width && firstImg.height) {
        ar = firstImg.width + ' / ' + firstImg.height;
      }
      host.innerHTML =
        '<style>' +
        '.sid-fade-slideshow{position:relative;width:100%;overflow:hidden;background:#000;border-radius:8px}' +
        '.sid-fade-slideshow > .sid-ss-stage{position:relative;width:100%;aspect-ratio:' + ar + ';max-width:960px;margin:0 auto}' +
        '.sid-fade-slideshow > .sid-ss-stage img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0;transition:opacity 1s ease}' +
        '.sid-fade-slideshow > .sid-ss-stage img.active{opacity:1}' +
        '.sid-fade-slideshow > .sid-ss-stage img:first-of-type{opacity:1}' +
        '.sid-fade-slideshow .sid-ss-dots{position:relative;margin-top:10px;text-align:center;padding:8px 0}' +
        '.sid-fade-slideshow .sid-ss-dots span{display:inline-block;width:10px;height:10px;margin:0 5px;border-radius:50%;background:rgba(0,242,255,.35);cursor:pointer;border:none}' +
        '.sid-fade-slideshow .sid-ss-dots span.on{background:#00f2ff}' +
        '@media (max-width:800px){.sid-fade-slideshow > .sid-ss-stage{aspect-ratio:auto}.sid-fade-slideshow > .sid-ss-stage img{position:relative;display:block;width:100%;height:auto;opacity:1}.sid-fade-slideshow > .sid-ss-stage img:not(.active){display:none}}' +
        '</style>' +
        '<div class="sid-ss-stage">' +
        imgs.map(function (im, i) {
          return '<img src="' + im.url + '" alt="' + im.alt + '"' +
            (i === order[0] ? ' class="active"' : '') + ' loading="lazy">';
        }).join('') +
        '</div>' +
        '<div class="sid-ss-dots">' +
        imgs.map(function (_, i) {
          return '<span data-i="' + i + '"' +
            (i === 0 ? ' class="on"' : '') + '></span>';
        }).join('') + '</div>';

      var stage = host.querySelector('.sid-ss-stage');
      var nodes = stage.querySelectorAll('img');
      var dots = host.querySelectorAll('.sid-ss-dots span');
      function show(idx) {
        for (var k = 0; k < nodes.length; k++) {
          nodes[k].classList.toggle('active', order.indexOf(k) === idx);
        }
        for (var d = 0; d < dots.length; d++) {
          dots[d].classList.toggle('on', d === idx);
        }
        index = idx;
      }
      for (var p = 0; p < dots.length; p++) {
        (function (n) {
          dots[n].addEventListener('click', function () { show(n); });
        })(p);
      }
      if (cfg.autoplay === '1' || cfg.autoplay === true) {
        setInterval(function () {
          var next = (index + 1) % imgs.length;
          show(next);
        }, speed * 1000);
      }
    }
  };
  window.wSlideshow = API;
})();
