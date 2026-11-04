/* 타이포그래피 효과 — 메인·지점 페이지 공용
   - .hero-tit / .bhero-tit / .big-tit : <br> 기준으로 줄을 나눠 아래에서 위로 차례로 올라오게 (.ln > span)
   - [data-words] : 단어 단위로 나눠 하나씩 떠오르게 (.w)
   - 히어로는 로드 직후, 나머지는 main.js/branch.js 의 IntersectionObserver 가 .in 을 붙일 때 재생 */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.hero-tit, .bhero-tit, .big-tit').forEach(function (el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (p, i) {
      return '<span class="ln"><span style="--i:' + i + '">' + p.trim() + '</span></span>';
    }).join('');
    el.classList.add('has-ln');
  });

  document.querySelectorAll('[data-words]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" style="--i:' + i + '">' + w + '</span>';
    }).join(' ');
  });

  var hero = document.querySelector('.hero-in, .bhero-in');
  if (hero) {
    if (reduce) hero.classList.add('in');
    else setTimeout(function () { hero.classList.add('in'); }, 120);
  }
})();
