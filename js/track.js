// 방문 기록: /api/track (D1 hits) 로 보낸다. 관리자 > 방문자 통계에서 본다.
//  - view  : 페이지를 열 때 한 번 (새로고침은 세지 않음)
//  - event : 전화 · 카카오톡 · 네이버 예약 · 인스타 · 블로그 · 지도 버튼 클릭, 가격표를 본 경우(price)
//  - leave : 페이지를 떠날 때 화면에 보인 시간(초)과 스크롤 깊이(%)
// 개인정보 없음 — 페이지 경로, 유입 주소, 브라우저별 무작위 ID, 화면 크기, 언어만 보낸다.
(function () {
  'use strict';
  if (!window.fetch || location.protocol === 'file:' || /github\.io$/.test(location.hostname)) return;
  if (/^\/admin/.test(location.pathname) || navigator.webdriver) return;

  var URL_ = '/api/track';
  var hexId = function (n) { var a = new Uint8Array(n); (window.crypto || window.msCrypto).getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); };
  var sid = '';
  try { sid = localStorage.getItem('jj_sid') || ''; if (!/^[a-f0-9]{16}$/.test(sid)) { sid = hexId(8); localStorage.setItem('jj_sid', sid); } } catch (e) { sid = ''; }
  var pvid = hexId(6);
  var page = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';

  // 어디서 왔는지는 이 방문(탭)의 첫 페이지에서 한 번 정해 두고, 사이트 안에서 이동해도 그대로 쓴다
  var src = { r: '', q: '' };
  try {
    var saved = sessionStorage.getItem('jj_src');
    if (saved) src = JSON.parse(saved);
    else {
      var ref = document.referrer || '';
      try { if (ref && new URL(ref).host === location.host) ref = ''; } catch (e) { ref = ''; }
      src = { r: ref.slice(0, 500), q: /utm_/.test(location.search) ? location.search.slice(1, 300) : '' };
      sessionStorage.setItem('jj_src', JSON.stringify(src));
    }
  } catch (e) {}

  function send(data, beacon) {
    data.p = page; data.sid = sid || null; data.v = pvid; data.r = src.r || ''; data.q = src.q || '';
    var body = JSON.stringify(data);
    try {
      if (beacon && navigator.sendBeacon && navigator.sendBeacon(URL_, new Blob([body], { type: 'application/json' }))) return;
      fetch(URL_, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: body }).catch(function () {});
    } catch (e) {}
  }

  // 페이지 열람 (새로고침은 다시 세지 않는다)
  var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || null;
  if (!(nav && nav.type === 'reload')) {
    send({ t: 'view', s: (screen.width || 0) + 'x' + (screen.height || 0), l: (navigator.language || '').slice(0, 10) });
  }

  // 버튼 클릭
  function kind(href) {
    if (/^tel:/i.test(href)) return 'tel';
    if (/pf\.kakao\.com|open\.kakao\.com|kakao\.com\/o\//i.test(href)) return 'kakao';
    if (/booking\.naver\.com/i.test(href)) return 'booking';
    if (/instagram\.com/i.test(href)) return 'insta';
    if (/blog\.naver\.com/i.test(href)) return 'blog';
    if (/map\.naver\.com|place\.naver\.com|naver\.me|maps\.google|google\.[a-z.]+\/maps/i.test(href)) return 'map';
    return '';
  }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var k = kind(a.getAttribute('href') || '');
    if (k) send({ t: 'event', e: k }, true);
  }, true);

  // 가격표를 실제로 본 경우 (가격표가 화면에 1초 이상 보이면 한 번)
  var priceSent = false;
  function watchPrice() {
    if (!('IntersectionObserver' in window)) return;
    var timer = null;
    var io = new IntersectionObserver(function (es) {
      var seen = es.some(function (x) { return x.isIntersecting; });
      if (seen && !priceSent && !timer) timer = setTimeout(function () { priceSent = true; send({ t: 'event', e: 'price' }); io.disconnect(); }, 1000);
      else if (!seen && timer) { clearTimeout(timer); timer = null; }
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(document.querySelectorAll('.price'), function (el) { io.observe(el); });
  }
  (window.CMS_READY || Promise.resolve()).then(function () { setTimeout(watchPrice, 300); });

  // 머문 시간 · 스크롤 깊이
  var shown = document.visibilityState === 'visible' ? Date.now() : 0, total = 0, depth = 0;
  function measure() {
    var h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
    if (h > 0) depth = Math.max(depth, Math.min(100, Math.round(((window.scrollY || 0) + window.innerHeight) / h * 100)));
  }
  window.addEventListener('scroll', measure, { passive: true });
  function leave() {
    if (shown) { total += Date.now() - shown; shown = 0; }
    measure();
    var sec = Math.round(total / 1000);
    if (sec >= 1) send({ t: 'leave', d: Math.min(sec, 3600), sd: depth }, true);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') leave(); else shown = Date.now();
  });
  window.addEventListener('pagehide', leave);
})();
