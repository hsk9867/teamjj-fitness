// 관리자에서 바꾼 내용(js/cms.js)이 적용된 뒤에 초기화한다
(window.CMS_READY || Promise.resolve()).then(function () {
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
  var els = document.querySelectorAll('.zone, .big-tit, .price-wrap, .hours-wrap, .bcircle');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .1 });
    var n = 0;
    els.forEach(function (el) {
      el.classList.add('rv');
      if (el.classList.contains('zone') || el.classList.contains('bcircle')) el.style.transitionDelay = (n++ % 3) * 0.08 + 's';
      io.observe(el);
    });
  }
})();

// 시설 존 사진 슬라이드
(function () {
  document.querySelectorAll('.zone').forEach(function (zone) {
    var track = zone.querySelector('.ztrack');
    var prev = zone.querySelector('.zarrow.prev');
    var next = zone.querySelector('.zarrow.next');
    var cnt = zone.querySelector('.zone-cnt b');
    if (!track || !prev) return;
    var slides = track.querySelectorAll('.zslide');
    function step() { return slides[0].getBoundingClientRect().width + 10; }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      if (cnt) cnt.textContent = Math.min(slides.length, Math.round(track.scrollLeft / step()) + 1);
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
});
