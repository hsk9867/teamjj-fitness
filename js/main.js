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

  // 히어로 슬라이드
  var slides = document.querySelectorAll('.hero-slide');
  var dotsBox = document.getElementById('heroDots');
  var cur = 0, timer;
  slides.forEach(function (_, i) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', (i + 1) + '번 슬라이드');
    b.addEventListener('click', function () { go(i); start(); });
    dotsBox.appendChild(b);
  });
  var dots = dotsBox.children;
  function go(i) {
    slides[cur].classList.remove('is-on'); dots[cur].classList.remove('is-on');
    cur = (i + slides.length) % slides.length;
    slides[cur].classList.add('is-on'); dots[cur].classList.add('is-on');
  }
  function start() { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 5000); }
  dots[0].classList.add('is-on');
  start();

  // 지점 탭
  var tabs = document.querySelectorAll('.find-tab');
  var panels = document.querySelectorAll('.panel');
  function loadMap(panel) {
    var box = panel.querySelector('.panel-map');
    if (!box || box.firstChild) return;
    var f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=' + box.dataset.map + '&z=16&hl=ko&output=embed';
    f.loading = 'lazy';
    f.title = panel.querySelector('h3').textContent + ' 지도';
    box.appendChild(f);
  }
  function select(id) {
    tabs.forEach(function (t) {
      var on = t.dataset.branch === id;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on);
    });
    panels.forEach(function (p) {
      var on = p.dataset.branch === id;
      p.classList.toggle('is-on', on);
      p.hidden = !on;
      if (on) loadMap(p);
    });
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { select(t.dataset.branch); }); });

  // 원형 버튼·푸터 링크 → 해당 지점 선택
  document.querySelectorAll('a[data-branch]').forEach(function (a) {
    a.addEventListener('click', function () { select(a.dataset.branch); });
  });
  // 회원권 메뉴 → 현재 지점 가격표 강조
  document.querySelectorAll('[data-tab-link="price"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var p = document.querySelector('.panel.is-on [data-price]');
      if (!p) return;
      p.classList.remove('flash'); void p.offsetWidth; p.classList.add('flash');
    });
  });

  // 지도는 섹션 근처에서 로드
  var find = document.getElementById('find');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { loadMap(document.querySelector('.panel.is-on')); o.disconnect(); }
    }, { rootMargin: '400px' }).observe(find);
  } else {
    loadMap(document.querySelector('.panel.is-on'));
  }

  // 스크롤 등장
  var els = document.querySelectorAll('.bcircle, .big-tit, .find-wrap, .intro-logo, .intro-tit');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .12 });
    var n = 0;
    els.forEach(function (el) {
      el.classList.add('rv');
      if (el.classList.contains('bcircle')) el.style.transitionDelay = (n++ % 4) * 0.1 + 's';
      io.observe(el);
    });
  }
})();

// 가로 슬라이드 공통 (비포애프터 · 회원 후기) — 지점 페이지 .zone 슬라이더와 같은 마크업
(function () {
  document.querySelectorAll('.zslider').forEach(function (box) {
    var track = box.querySelector('.ztrack');
    var prev = box.querySelector('.zarrow.prev');
    var next = box.querySelector('.zarrow.next');
    if (!track || !prev) return;
    var sec = box.closest('section');
    var cnt = sec ? sec.querySelector('.zone-cnt b') : null;
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
