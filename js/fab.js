/* 플로팅 연락 버튼 (카톡 · 인스타 · 전화)
   카카오톡 채널 주소가 정해지면 아래 KAKAO_URL 에만 넣으면 됨 (예: 'https://pf.kakao.com/_xxxxx').
   비어 있으면 카톡 버튼은 전화 버튼과 같은 동작을 함. */
var KAKAO_URL = '';

(function () {
  var fab = document.getElementById('fab');
  if (!fab) return;
  var kakao = fab.querySelector('.fab-kakao');
  var telBtn = fab.querySelector('.fab-tel');
  var pop = fab.querySelector('.fab-pop');

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
    if (KAKAO_URL) {
      kakao.setAttribute('href', KAKAO_URL);
      kakao.setAttribute('target', '_blank');
      kakao.setAttribute('rel', 'noopener');
    } else if (pop) {
      kakao.addEventListener('click', togglePop);
    } else {
      kakao.setAttribute('href', telBtn.getAttribute('href'));
    }
  }
})();
