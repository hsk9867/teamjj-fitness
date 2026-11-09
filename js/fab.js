/* 플로팅 연락 버튼 (카톡 · 인스타 · 전화)
   카카오톡 채널 주소는 관리자 페이지(/admin)에서 넣는다 — 메인은 "카카오톡 채널 주소", 지점 페이지는 지점별 주소(없으면 메인 주소).
   관리자를 쓰지 않을 때는 아래 KAKAO_URL 에 직접 넣어도 된다 (예: 'https://pf.kakao.com/_xxxxx').
   주소가 없으면 카톡 버튼은 전화 버튼과 같은 동작을 한다. */
var KAKAO_URL = '';

(window.CMS_READY || Promise.resolve()).then(function () {
  var fab = document.getElementById('fab');
  if (!fab) return;
  var kakao = fab.querySelector('.fab-kakao');
  var telBtn = fab.querySelector('.fab-tel');
  var pop = fab.querySelector('.fab-pop');

  var text = (window.CMS_DATA && window.CMS_DATA.text) || {};
  var branch = document.body.getAttribute('data-branch');
  var kakaoUrl = (branch && text[branch + '.kakao']) || text['site.kakao'] || KAKAO_URL;
  if (!/^https?:\/\//i.test(kakaoUrl || '')) kakaoUrl = '';

  function openPop() { pop.classList.add('is-open'); telBtn.setAttribute('aria-expanded', 'true'); }
  function closePop() { pop.classList.remove('is-open'); telBtn.setAttribute('aria-expanded', 'false'); }
  function togglePop(e) {
    e.preventDefault();
    if (pop.classList.contains('is-open')) closePop(); else openPop();
  }

  if (pop) {
    telBtn.addEventListener('click', togglePop);
    document.addEventListener('click', function (e) { if (!fab.contains(e.target)) closePop(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });
  }

  if (kakao) {
    if (kakaoUrl) {
      kakao.setAttribute('href', kakaoUrl);
      kakao.setAttribute('target', '_blank');
      kakao.setAttribute('rel', 'noopener');
    } else if (pop) {
      kakao.addEventListener('click', togglePop);
    } else {
      kakao.setAttribute('href', telBtn.getAttribute('href'));
    }
  }
});
