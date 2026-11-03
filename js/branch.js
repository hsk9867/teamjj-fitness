(function () {
  // 모바일 메뉴
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });

  // 지도 (섹션 근처에서 로드)
  var box = document.querySelector('.panel-map');
  function loadMap() {
    if (!box || box.firstChild) return;
    var f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=' + box.dataset.map + '&z=16&hl=ko&output=embed';
    f.loading = 'lazy';
    f.title = box.dataset.name + ' 지도';
    box.appendChild(f);
  }
  if (box && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { loadMap(); o.disconnect(); }
    }, { rootMargin: '500px' }).observe(box);
  } else {
    loadMap();
  }

  // 서브 내비 현재 섹션 표시
  var links = document.querySelectorAll('.subnav a[data-sub]');
  var secs = [];
  links.forEach(function (a) { var s = document.getElementById(a.dataset.sub); if (s) secs.push(s); });
  function mark() {
    var y = window.scrollY + 160, cur = secs[0];
    secs.forEach(function (s) { if (s.offsetTop <= y) cur = s; });
    links.forEach(function (a) { a.classList.toggle('is-on', cur && a.dataset.sub === cur.id); });
  }
  window.addEventListener('scroll', mark, { passive: true });
  mark();

  // 스크롤 등장
  var els = document.querySelectorAll('.fac, .big-tit, .price-wrap, .hours-wrap, .bcircle');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .1 });
    var n = 0;
    els.forEach(function (el) {
      el.classList.add('rv');
      if (el.classList.contains('fac') || el.classList.contains('bcircle')) el.style.transitionDelay = (n++ % 3) * 0.08 + 's';
      io.observe(el);
    });
  }
})();
