// 팀JJ피트니스 CMS 로더: 관리자 페이지(/admin)에서 저장한 값(/api/content, D1)으로 문구·가격표·운영시간·리뷰·사진을 덮어쓴다.
// 덮어쓴 뒤에는 자주 묻는 질문의 금액과 구조화 데이터(JSON-LD)도 같은 내용으로 맞춘다.
// <head> 에서 읽혀 바로 요청을 보내고, window.CMS_READY(Promise) 가 끝난 뒤 type.js / main.js / branch.js / fab.js 가 초기화한다.
// 응답이 늦으면(1.2초) 원래 HTML 그대로 보여준다. file:// 나 GitHub Pages 미리보기에서는 건너뛴다.
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('cms-wait');

  var BRANCHES = ['okgye', 'daegok', 'hyeonggok', 'bonggok'];
  // 전화번호 기본값 — 관리자에서 바꾸면 페이지 안의 모든 표기·tel: 링크를 한꺼번에 바꾼다 (src/build_branches.py 와 같아야 함)
  var TEL = { okgye: '0507-1486-8853', daegok: '0507-1395-0089', hyeonggok: '0507-1381-6729', bonggok: '0507-1385-0910' };
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.7 5.9 21.1l1.4-6.8L2.2 9.6l6.9-.8z"/></svg>';
  var ARROWS = '<button class="zarrow prev" type="button" aria-label="이전">&#8249;</button><button class="zarrow next" type="button" aria-label="다음">&#8250;</button>';

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  // rich: 줄바꿈 → <br>, **강조** → 레드 글자
  var rich = function (s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="hl">$1</span>').replace(/\r?\n/g, '<br>'); };
  var lines = function (s) { return String(s || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean); };
  var okUrl = function (u) { return /^(https?:\/\/|tel:|mailto:|#|\/)/i.test(u || ''); };
  var list = function (v) { return Array.isArray(v) && v.length ? v : null; };
  var each = function (sel, fn, ctx) { Array.prototype.forEach.call((ctx || document).querySelectorAll(sel), fn); };

  function fetchContent() {
    if (!window.fetch || location.protocol === 'file:' || /github\.io$/.test(location.hostname)) return Promise.resolve(null);
    var ctl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 1200);
    return fetch('/api/content', { signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(timer); return r.ok ? r.json() : null; })
      .catch(function () { clearTimeout(timer); return null; });
  }

  // 문구 · 링크 · 사진 한 장짜리
  function applyText(text) {
    each('[data-cms]', function (el) {
      var k = el.getAttribute('data-cms');
      if (!(k in text)) return;
      var v = text[k], attr = el.getAttribute('data-cms-attr'), fmt = el.getAttribute('data-cms-fmt');
      if (attr) { el.setAttribute(attr, v); return; }
      if (fmt === 'rich') el.innerHTML = rich(v);
      else if (fmt === 'lines') el.innerHTML = lines(v).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      else el.textContent = v;
    });
    each('[data-cms-href]', function (a) {
      var v = text[a.getAttribute('data-cms-href')];
      if (v && okUrl(v)) a.setAttribute('href', v);
    });
    each('[data-cms-bg]', function (el) {
      var v = text[el.getAttribute('data-cms-bg')];
      if (v) el.style.backgroundImage = 'url("' + String(v).replace(/["\\\n]/g, '') + '")';
    });
  }

  // 전화번호: 화면의 옛 번호 표기와 tel: 링크를 모두 새 번호로
  function applyTel(text) {
    BRANCHES.forEach(function (b) {
      var nv = (text[b + '.tel'] || '').trim(), old = TEL[b];
      if (!nv || nv === old) return;
      var oldHref = 'tel:' + old.replace(/\D/g, ''), newHref = 'tel:' + nv.replace(/[^0-9+]/g, '');
      each('a[href="' + oldHref + '"]', function (a) { a.setAttribute('href', newHref); });
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) if (n.nodeValue.indexOf(old) > -1) n.nodeValue = n.nodeValue.split(old).join(nv);
    });
  }

  // 가격표: price.<지점> = { note, rows:[{k,v}], pt_note, pt:[{k,v}] }
  var priceUl = function (rows) { return rows.map(function (r) { return '<li><span>' + esc(r.k) + '</span><b>' + esc(r.v) + '</b></li>'; }).join(''); };
  function applyPrices(map) {
    BRANCHES.forEach(function (b) {
      var p = map['price.' + b];
      if (!p || typeof p !== 'object') return;
      each('[data-cms-price="' + b + '"]', function (box) {
        var em = box.querySelector('.price-tit em'), ul = box.querySelector('ul:not(.price-note)');
        if (em && p.note) em.textContent = p.note;
        if (ul && list(p.rows)) ul.innerHTML = priceUl(p.rows);
        // PT 가격표: 있으면 고치고, 없던 지점이면 새로 만든다
        if (!list(p.pt)) return;
        var scope = box.parentNode, pt = scope.querySelector('[data-cms-pt="' + b + '"]');
        var html = '<p class="price-tit">PERSONAL TRAINING <em>' + esc(p.pt_note || '') + '</em></p><ul>' + priceUl(p.pt) + '</ul>';
        if (pt && pt.classList.contains('price')) {
          var note = pt.querySelector('.price-note');
          pt.innerHTML = html + (note ? note.outerHTML : '');
        } else {
          var div = document.createElement('div');
          div.className = 'price'; div.setAttribute('data-cms-pt', b); div.innerHTML = html;
          if (pt) pt.parentNode.replaceChild(div, pt); else box.parentNode.insertBefore(div, box.nextSibling);
        }
      });
    });
  }

  // 자주 묻는 질문 속 금액: 가격표를 바꾸면 답변 문장의 금액도 같이 바뀐다 (답변을 관리자에서 직접 고쳐 쓴 경우는 그 글이 우선)
  var wonList = function (rows) { return rows.map(function (r) { return r.k + ' ' + r.v + (/\d$/.test(r.v) ? '원' : ''); }).join(', '); };
  function applyFaqPrice(map) {
    BRANCHES.forEach(function (b) {
      var p = map['price.' + b];
      if (!p || typeof p !== 'object') return;
      if (list(p.rows)) each('[data-faq-price="' + b + '"]', function (el) { el.textContent = wonList(p.rows); });
      if (p.note) each('[data-faq-pnote="' + b + '"]', function (el) { el.textContent = p.note; });
      if (!list(p.pt)) return;
      each('[data-faq-pt="' + b + '"]', function (el) { el.textContent = wonList(p.pt); });
      each('[data-faq-ptwrap="' + b + '"]', function (el) { el.textContent = '네, PT 가격은 ' + wonList(p.pt) + '입니다' + (p.pt_note ? '(' + p.pt_note + ')' : '') + '.'; });
    });
  }

  // ───── 구조화 데이터(JSON-LD) 맞추기 ─────
  // 관리자에서 바꾼 질문·가격·전화·주소·운영시간을 검색엔진·AI 가 읽는 데이터(#ld-faq · #ld-main)에도 반영한다.
  var DAY_ORDER = '월화수목금토일', DAYS = { '월': 'Monday', '화': 'Tuesday', '수': 'Wednesday', '목': 'Thursday', '금': 'Friday', '토': 'Saturday', '일': 'Sunday' };
  function parseDays(k) {
    k = String(k).replace(/요일/g, '').replace(/\s/g, '');
    if (k === '매일' || k === '연중무휴') return DAY_ORDER.split('');
    if (k === '평일') return '월화수목금'.split('');
    if (k === '주말') return ['토', '일'];
    var m = k.match(/^([월화수목금토일])[~\-–]([월화수목금토일])$/);
    if (m) { var a = DAY_ORDER.indexOf(m[1]), z = DAY_ORDER.indexOf(m[2]); return a <= z ? DAY_ORDER.slice(a, z + 1).split('') : null; }
    var parts = k.split(/[·,\/]/);
    return parts.every(function (x) { return x.length === 1 && DAYS[x]; }) ? parts : null;
  }
  // 요일별 운영시간 표 → openingHoursSpecification. 읽을 수 없는 줄이 하나라도 있으면 null (틀린 데이터를 내보내지 않는다)
  function hoursSpec(rows) {
    var out = [], pad = function (t) { return t.length === 4 ? '0' + t : t; };
    for (var i = 0; i < rows.length; i++) {
      var days = parseDays(rows[i].k), v = String(rows[i].v).replace(/\s/g, '');
      if (!days) return null;
      if (/휴무/.test(v)) continue;
      var m = v === '24시간' ? [0, '00:00', '24:00'] : v.match(/^(\d{1,2}:\d{2})[~\-–](\d{1,2}:\d{2})$/);
      if (!m) return null;
      out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: days.map(function (d) { return DAYS[d]; }), opens: pad(m[1]), closes: m[2] === '24:00' ? '23:59' : pad(m[2]) });
    }
    return out;
  }
  function syncLd(map, text) {
    var s = document.getElementById('ld-faq'), qa = [];
    each('.faq-list details', function (d) {
      var q = d.querySelector('summary'), a = d.querySelector('.faq-a');
      var qt = q ? q.textContent.replace(/\s+/g, ' ').trim() : '', at = a ? a.textContent.replace(/\s+/g, ' ').trim() : '';
      if (qt && at) qa.push({ '@type': 'Question', name: qt, acceptedAnswer: { '@type': 'Answer', text: at } });
    });
    if (s && qa.length) s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qa });

    s = document.getElementById('ld-main');
    if (!s) return;
    var j, dirty = false, num = function (v) { return String(v).replace(/[^0-9]/g, ''); };
    try { j = JSON.parse(s.textContent); } catch (e) { return; }
    (j['@graph'] || []).forEach(function (n) {
      var m = /\/([a-z]+)#gym$/.exec(n['@id'] || ''), b = m && m[1];
      if (!b || BRANCHES.indexOf(b) < 0) return;
      var tel = (text[b + '.tel'] || '').trim(), addr = (text[b + '.addr'] || '').trim(), p = map['price.' + b], h = list(map['hours.' + b]);
      if (tel) { n.telephone = /^0/.test(tel) ? '+82-' + tel.slice(1) : tel; dirty = true; }
      if (addr) { n.address = { '@type': 'PostalAddress', streetAddress: addr, addressCountry: 'KR' }; dirty = true; }
      if (h) { var spec = hoursSpec(h); if (spec && spec.length) n.openingHoursSpecification = spec; else delete n.openingHoursSpecification; dirty = true; }
      if (!p || typeof p !== 'object') return;
      var offer = function (name, v) { return { '@type': 'Offer', name: name, price: num(v), priceCurrency: 'KRW', url: n.url + '#price' }; };
      var cat = n.hasOfferCatalog, old = (cat && cat.itemListElement) || [], isMem = function (o) { return /^헬스 회원권/.test(o.name || ''); };
      var mem = list(p.rows) ? p.rows.map(function (r) { return offer('헬스 회원권 ' + r.k, r.v); }) : old.filter(isMem);
      var pt = list(p.pt) ? p.pt.map(function (r) { return offer(/PT/i.test(r.k) ? r.k : 'PT ' + r.k, r.v); }) : old.filter(function (o) { return !isMem(o); });
      var ok = function (o) { return !!o.price; }, prices = mem.filter(ok).map(function (o) { return +o.price; });
      if (cat) cat.itemListElement = mem.concat(pt).filter(ok);
      if (prices.length) n.priceRange = Math.min.apply(null, prices).toLocaleString('ko-KR') + '원 ~ ' + Math.max.apply(null, prices).toLocaleString('ko-KR') + '원';
      dirty = true;
    });
    if (dirty) s.textContent = JSON.stringify(j);
  }

  // 요일별 운영시간(지점 페이지): hours.<지점> = [{k,v}]
  function applyHours(map) {
    each('[data-cms-hours]', function (ul) {
      var rows = list(map['hours.' + ul.getAttribute('data-cms-hours')]);
      if (!rows) return;
      each('li:not([data-fixed])', function (li) { li.parentNode.removeChild(li); }, ul);
      ul.insertAdjacentHTML('afterbegin', rows.map(function (r) {
        return '<li class="' + (/휴무/.test(r.v) ? 'off' : '') + '"><span>' + esc(r.k) + '</span><b>' + esc(r.v) + '</b></li>';
      }).join(''));
    });
  }

  function setCount(sec, n) {
    var c = sec && sec.querySelector('.zone-cnt');
    if (c) c.innerHTML = '<b>1</b> / ' + n;
  }

  // 회원 후기: reviews = [{stars, text, tags, name, src}]
  function applyReviews(map) {
    var track = document.getElementById('revTrack'), rows = list(map.reviews);
    if (!track || !rows) return;
    track.innerHTML = rows.map(function (r) {
      var n = Math.max(1, Math.min(5, parseInt(r.stars, 10) || 5)), stars = '';
      for (var i = 0; i < n; i++) stars += STAR;
      var tags = String(r.tags || '').split(/[,\n]/).map(function (x) { return x.trim(); }).filter(Boolean);
      return '<figure class="zslide rev-card"><div class="rev-stars" aria-label="별점 ' + n + '점">' + stars + '</div><blockquote>' + rich(r.text) + '</blockquote>' +
        (tags.length ? '<ul class="rev-tags">' + tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
        '<figcaption><b>' + esc(r.name) + '</b><span>' + esc(r.src) + '</span></figcaption></figure>';
    }).join('');
    setCount(track.closest('section'), rows.length);
  }

  // 메인 사진: slides.hero [{src, lite}] · slides.ba [{src, alt}] · slides.fast [{src}]
  function applySlides(map) {
    var hero = document.getElementById('heroSlides'), rows = list(map['slides.hero']);
    if (hero && rows) hero.innerHTML = rows.map(function (r, i) {
      return '<div class="hero-slide' + (r.lite ? ' lite' : '') + (i ? '' : ' is-on') + '" style="background-image:url(&quot;' + esc(r.src) + '&quot;)"></div>';
    }).join('');

    var ba = document.getElementById('baTrack'); rows = list(map['slides.ba']);
    if (ba && rows) {
      ba.innerHTML = rows.map(function (r, i) {
        return '<figure class="zslide ba-slide"><img src="' + esc(r.src) + '" alt="' + esc(r.alt || ('팀JJ피트니스 회원 비포 애프터 ' + (i + 1))) + '" loading="lazy" decoding="async"></figure>';
      }).join('');
      setCount(ba.closest('section'), rows.length);
    }

    var fa = document.getElementById('fastA'), fb = document.getElementById('fastB'); rows = list(map['slides.fast']);
    if (fa && fb && rows) {
      var half = Math.ceil(rows.length / 2);
      var row = function (arr) { var h = arr.map(function (r) { return '<img src="' + esc(r.src) + '" alt="" loading="lazy" decoding="async">'; }).join(''); return h + h; };
      fa.innerHTML = row(rows.slice(0, half));
      fb.innerHTML = row(rows.slice(half).length ? rows.slice(half) : rows);
    }
  }

  // 지점 시설 사진(존별 슬라이드): fac.<지점>.<존> = [{src, alt}]
  function applyFacility(map) {
    var b = document.body.getAttribute('data-branch');
    if (!b) return;
    each('.zone[data-zone]', function (zone) {
      var rows = list(map['fac.' + b + '.' + zone.getAttribute('data-zone')]);
      if (!rows) return;
      var name = (zone.querySelector('.zone-head h3') || {}).firstChild;
      name = ((document.querySelector('.bhero-tit') || {}).textContent || '').replace(/^\s*팀JJ피트니스\s*/, '').trim() + ' ' + (name ? name.textContent.trim() : '');
      var box = zone.querySelector('.zslider'), head = zone.querySelector('.zone-head'), cnt = head.querySelector('.zone-cnt');
      box.innerHTML = '<div class="ztrack">' + rows.map(function (r, i) {
        return '<figure class="zslide"><img src="' + esc(r.src) + '" alt="' + esc(r.alt || ('팀JJ피트니스 ' + name + ' ' + (i + 1))) + '" loading="lazy" decoding="async"></figure>';
      }).join('') + '</div>' + (rows.length > 1 ? ARROWS : '');
      if (cnt) cnt.parentNode.removeChild(cnt);
      if (rows.length > 1) head.insertAdjacentHTML('beforeend', '<span class="zone-cnt"><b>1</b> / ' + rows.length + '</span>');
    });
  }

  function apply(map) {
    if (!map) return;
    var text = map.text || {};
    [function () { applyText(text); }, function () { applyTel(text); }, function () { applyPrices(map); }, function () { applyFaqPrice(map); },
     function () { applyHours(map); }, function () { applyReviews(map); }, function () { applySlides(map); }, function () { applyFacility(map); },
     function () { syncLd(map, text); }]
      .forEach(function (fn) { try { fn(); } catch (e) { /* 한 항목이 실패해도 나머지는 적용 */ } });
  }

  var domReady = new Promise(function (res) {
    if (document.readyState !== 'loading') res(); else document.addEventListener('DOMContentLoaded', function () { res(); });
  });
  window.CMS_READY = Promise.all([fetchContent(), domReady]).then(function (r) {
    apply(r[0]);
    window.CMS_DATA = r[0] || {};
    root.classList.remove('cms-wait');
  });
})();
