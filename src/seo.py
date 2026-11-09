# -*- coding: utf-8 -*-
"""검색(SEO) · 답변 엔진(AEO) · 생성형 AI(GEO)용 출력물.
   build_branches.py 가 BRANCHES 데이터를 넘겨 호출한다 — 가격·주소·전화·운영시간의 원본은 BRANCHES 한 곳뿐이다.
     head()                      <head> 의 제목·설명·OG·지역 메타
     home_faq() / branch_faq()   자주 묻는 질문 (화면 + FAQPage 구조화 데이터 + llms.txt 에 같이 쓰임)
     home_ld() / branch_ld()     JSON-LD (Organization · HealthClub · WebPage · BreadcrumbList)
     sitemap() / llms() / robots()
   FAQ 답변 안의 <span data-cms="…"> · data-faq-price 는 관리자에서 주소·가격을 바꾸면 js/cms.js 가 같이 바꿔 주는 자리."""
import datetime, glob, html, json, os, re

SITE = 'https://teamjjfitness.co.kr'
BRAND = '팀JJ피트니스'
BRAND_EN = 'TEAM JJ FITNESS'
TODAY = datetime.date.today().isoformat()
PUBLISHED = '2026-11-09'
ORDER = ['okgye', 'daegok', 'hyeonggok', 'bonggok']
MACHINES = '해머스트랭스 · 싸이벡스 · 파나타 · 프라임 · 아틀란티스 · 테크노짐 · 너틸러스 · 왓슨 · 호이스트 · 짐레코'
ZONE_KO = {'machine': '머신존', 'free': '프리웨이트존', 'cardio': '유산소존', 'locker': '탈의실'}

HOME_TITLE = f'{BRAND} | 구미 · 대구 24시간 프리미엄 헬스장'
HOME_DESC = (f'{BRAND}는 구미 옥계동 · 형곡동 · 봉곡동과 대구 달서구 대곡에 4개 지점을 둔 24시간 프리미엄 헬스장입니다. '
             '해머스트랭스 · 파나타 · 프라임 등 해외 명품 머신, 지점별 회원권 가격 · 운영시간 · 주차 안내.')
HOME_KW = [BRAND, BRAND_EN, '구미 헬스장', '구미 24시간 헬스장', '옥계동 헬스장', '형곡동 헬스장', '봉곡동 헬스장',
           '대구 달서구 헬스장', '대곡 헬스장', '구미 PT', '해머스트랭스']
HOME_LEAD = (f'{BRAND}({BRAND_EN})는 경북 구미시에 옥계점 · 형곡점 · 봉곡점, 대구 달서구에 대곡점까지 4개 지점을 운영하는 헬스장입니다. '
             f'{MACHINES} 등 해외 명품 머신을 지점마다 갖췄고(옥계점 · 대곡점 120종, 형곡점 100종), '
             '옥계점과 대곡점은 24시간 연중무휴, 형곡점과 봉곡점은 평일 24시간 운영합니다.')


def plain(s):
    """HTML 조각 → 글자만 (구조화 데이터 · llms.txt 용)"""
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()


def attr(s):
    return html.escape(s, quote=True)


def won(rows):
    return ', '.join(f'{a} {b}원' for a, b in rows)


def tel_href(t):
    return 'tel:' + t.replace('-', '')


def tel_intl(t):
    return '+82-' + t.lstrip('0')          # 0507-1486-8853 → +82-507-1486-8853


def tel_a(t):
    return f'<a href="{tel_href(t)}">{t}</a>'


def ld_script(obj, id_):
    body = json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    return f'<script type="application/ld+json" id="{id_}">\n{body}\n</script>'


def title_of(b):
    return f'{b["tkw"]} {BRAND} {b["ko"]} | 가격 · 운영시간 · PT'


def desc_of(b):
    k0, v0 = b['price'][0]
    return f'{BRAND} {b["ko"]} — {b["lead"]}. 회원권 {k0} {v0}원부터, {b["parking"]}. {b["addr"]} · {b["tel"]}'


# ───────────────────────── <head> ─────────────────────────
def head(title, desc, path, image, size, image_alt, keywords, og_desc=None, geo=None, placename='', region=''):
    url, img = SITE + path, SITE + '/' + image
    L = [
        f'<title>{html.escape(title, quote=False)}</title>',
        f'<meta name="description" content="{attr(desc)}">',
        f'<meta name="keywords" content="{attr(", ".join(keywords))}">',
        f'<link rel="canonical" href="{url}">',
        f'<meta property="og:url" content="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:locale" content="ko_KR">',
        f'<meta property="og:site_name" content="{BRAND}">',
        f'<meta property="og:title" content="{attr(title)}">',
        f'<meta property="og:description" content="{attr(og_desc or desc)}">',
        f'<meta property="og:image" content="{img}">',
        f'<meta property="og:image:width" content="{size[0]}">',
        f'<meta property="og:image:height" content="{size[1]}">',
        f'<meta property="og:image:alt" content="{attr(image_alt)}">',
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{attr(title)}">',
        f'<meta name="twitter:description" content="{attr(og_desc or desc)}">',
        f'<meta name="twitter:image" content="{img}">',
        f'<meta name="author" content="{BRAND} ({BRAND_EN})">',
    ]
    if region:
        L.append(f'<meta name="geo.region" content="{region}">')
    if placename:
        L.append(f'<meta name="geo.placename" content="{attr(placename)}">')
    if geo:
        lat, lng = geo.split(',')
        L += [f'<meta name="geo.position" content="{lat};{lng}">', f'<meta name="ICBM" content="{lat}, {lng}">']
    L += [
        '<meta name="format-detection" content="telephone=yes">',
        '<meta name="theme-color" content="#030303">',
        f'<link rel="alternate" type="text/plain" href="{SITE}/llms.txt" title="llms.txt">',
        '<!-- 네이버 서치어드바이저 · 구글 서치콘솔 소유 확인 메타태그는 src/seo.py 의 VERIFY 에 넣고 build_branches.py 를 다시 실행 -->',
    ]
    L += VERIFY
    return '\n'.join(L)


# 검색 등록 소유 확인 태그 (받으면 여기에 한 줄씩). 예: '<meta name="naver-site-verification" content="…">'
VERIFY = [
    '<meta name="naver-site-verification" content="777e52311d65afb24471736e39c7acdf8944330f">',   # 네이버 서치어드바이저 (2026-11-09)
    '<meta name="google-site-verification" content="4UvOpgP6qP1XZ1gCHSQ1mKajcgvr_FSAc0iaLn60x4g">',   # 구글 서치콘솔 (2026-11-09)
]


# ───────────────────────── 자주 묻는 질문 ─────────────────────────
def faq_html(items, prefix):
    rows = ''.join(
        f'<details{" open" if i == 1 else ""}><summary data-cms="{prefix}.q{i}">{q}</summary>'
        f'<p class="faq-a" data-cms="{prefix}.a{i}" data-cms-fmt="rich">{a}</p></details>'
        for i, (q, a) in enumerate(items, 1))
    return f'<div class="faq-list">{rows}</div>'


def faq_ld(items):
    return {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': plain(q), 'acceptedAnswer': {'@type': 'Answer', 'text': plain(a)}} for q, a in items]}


def branch_faq(b):
    k, ko = b['key'], b['ko']
    name = f'{BRAND} {ko}'
    cs = lambda key: f'<span data-cms="{k}.{key}">{b[key]}</span>'
    book = '전화(' + tel_a(b['tel']) + ') 또는 네이버 예약' if b['booking'] else '전화(' + tel_a(b['tel']) + ')'
    pnote = f' (<span data-cms="{k}.parking_note">{b["parking_note"]}</span>)' if b['parking_note'] else ''
    if b['pt']:
        pt = (f'<span data-faq-ptwrap="{k}">네, PT 가격은 {won(b["pt"])}입니다({b["pt_note"]}).</span> '
              f'{b["pt_faq"]} 예약은 {book}으로 신청합니다.')
    else:
        pt = f'<span data-faq-ptwrap="{k}">네, 받을 수 있습니다. {cs("pt_text")}</span> 상담은 {book}으로 신청합니다.'
    items = [
        (f'{name} 회원권 가격은 얼마인가요?',
         f'{name} 회원권은 <span data-faq-price="{k}">{won(b["price"])}</span>입니다. '
         f'(<span data-faq-pnote="{k}">{b["price_note"]}</span>) {b["price_etc"][0]}'),
        (f'{ko}은 24시간 운영하나요? 휴무일은 언제인가요?',
         f'{cs("hours_sub")}합니다. {cs("closed")}이며, {cs("hours_note")}입니다.'),
        (f'{ko} 위치와 주차는 어떻게 되나요?',
         f'{cs("addr")}({cs("addr_note")})에 있습니다. 주차장은 {cs("parking")}{pnote}입니다. '
         f'가까운 버스 정류장은 {cs("bus")}입니다.'),
        (f'{ko}에는 어떤 운동 기구가 있나요?', ' '.join(b['fac'][z] for z in ('machine', 'free', 'cardio'))),
        (f'{ko}에서 PT(개인 레슨)를 받을 수 있나요?', pt),
        (f'{ko}에 샤워실과 탈의실이 있나요? 운동복도 주나요?', f'네. {b["fac"]["locker"]} {b["fac"]["shower"]}'),
    ]
    items += b['faq_extra']
    reg = ' 회원권은 상담 예약 없이 방문하시면 언제든 등록할 수 있습니다.' if k == 'bonggok' else ''
    items.append((f'{ko} 상담이나 등록 문의는 어떻게 하나요?',
                  f'{book}으로 상담을 신청할 수 있습니다.{reg} 네이버 지도(플레이스) · 인스타그램 · 블로그에서도 {ko} 소식을 확인할 수 있습니다.'))
    return items


def home_faq(BR):
    B = {b['key']: b for b in BR}
    cs = lambda k, key, val=None: f'<span data-cms="{k}.{key}">{val if val is not None else B[k][key]}</span>'
    each = lambda fn: ' '.join(f'{B[k]["ko"]}은 {fn(k)}입니다.' for k in ORDER)
    return [
        (f'{BRAND}는 어디에 있나요? 지점이 몇 개인가요?',
         '경북 구미시에 옥계점 · 형곡점 · 봉곡점, 대구 달서구에 대곡점까지 4개 지점이 있습니다. '
         + each(lambda k: f'{cs(k, "addr")}({cs(k, "addr_note")})')),
        (f'{BRAND} 회원권 가격은 얼마인가요?',
         '지점마다 다릅니다. ' + each(lambda k: f'<span data-faq-price="{k}">{won(B[k]["price"])}</span>')
         + ' 가격은 네이버 플레이스 등록 기준(2026년 10 ~ 11월)이며 지점 사정에 따라 바뀔 수 있습니다. 운동복 · 수건, 부가세, 학생 할인 같은 조건은 지점 페이지의 가격표에서 확인해 주세요.'),
        ('24시간 운영하나요? 휴무일은 언제인가요?',
         each(lambda k: f'{cs(k, "home.hours", B[k]["home_hours"])}({cs(k, "closed")})')),
        ('어떤 운동 기구가 있나요?',
         f'{MACHINES} 등 해외 명품 머신을 지점마다 갖췄습니다(옥계점 · 대곡점 120종, 형곡점 100종). '
         '옥계점은 구미 최초 해머스트랭스 오피셜 센터이며, 천국의 계단을 비롯한 유산소 머신과 파워랙 · 덤벨 프리웨이트 존도 지점마다 운영합니다.'),
        ('주차할 수 있나요?', '네, 모든 지점에 주차장이 있습니다. ' + each(lambda k: cs(k, 'parking'))),
        ('PT(개인 레슨)도 받을 수 있나요?',
         f'네, 모든 지점에서 PT를 운영합니다. 봉곡점은 <span data-faq-pt="bonggok">{won(B["bonggok"]["pt"])}</span>이고, '
         '옥계점 · 대곡점 · 형곡점은 상담 때 가격을 안내합니다. 대곡점은 회원가입 시 PT를 증정합니다.'),
        ('운동복과 수건, 샤워실이 있나요?',
         '네, 모든 지점에 남 · 녀 분리 탈의실과 개인 락커, 샤워장이 있고 회원권에는 운동복과 수건이 포함됩니다.'),
        ('상담이나 등록은 어떻게 하나요?',
         '지점으로 전화하거나 네이버 예약(옥계점 · 형곡점 · 봉곡점)으로 상담을 신청할 수 있습니다. '
         + ', '.join(f'{B[k]["ko"]} {tel_a(B[k]["tel"])}' for k in ORDER) + '.'),
    ]


# ───────────────────────── JSON-LD ─────────────────────────
def gym_id(k):
    return f'{SITE}/{k}#gym'


def fac_images(root, k, limit=None):
    out = []
    for z in ('machine', 'free', 'cardio', 'locker'):
        for f in sorted(glob.glob(os.path.join(root, 'images', 'fac', f'{k}-{z}-*.jpg'))):
            out.append((f'images/fac/{os.path.basename(f)}', z))
    return out[:limit] if limit else out


def gym_node(b, root, full):
    k = b['key']
    lat, lng = b['map'].split(',')
    nums = [int(v.replace(',', '')) for _, v in b['price']]
    n = {
        '@type': ['HealthClub', 'LocalBusiness'], '@id': gym_id(k),
        'name': f'{BRAND} {b["ko"]}', 'alternateName': [f'{BRAND_EN} {b["en"]}', f'팀JJ {b["ko"]}'],
        'description': b['intro'], 'url': f'{SITE}/{k}',
        'image': [f'{SITE}/images/bh-{k}.jpg'] + ([f'{SITE}/{p}' for p, z in fac_images(root, k) if p.endswith('-01.jpg')] if full else []),
        'telephone': tel_intl(b['tel']),
        'address': {'@type': 'PostalAddress', 'streetAddress': b['street'], 'addressLocality': b['locality'],
                    'addressRegion': b['region_full'], 'addressCountry': 'KR'},
        'geo': {'@type': 'GeoCoordinates', 'latitude': float(lat), 'longitude': float(lng)},
        'hasMap': b['place'],
        'openingHoursSpecification': [
            {'@type': 'OpeningHoursSpecification', 'dayOfWeek': d, 'opens': o, 'closes': c} for d, o, c in b['oh']],
        'priceRange': f'{min(nums):,}원 ~ {max(nums):,}원',
        'currenciesAccepted': 'KRW',
        'parentOrganization': {'@id': f'{SITE}/#org'},
    }
    if not full:
        return n
    n['logo'] = f'{SITE}/images/logo-full.png'
    n['areaServed'] = b['region']
    n['sameAs'] = [b['place'], b['blog'], b['insta']]
    n['amenityFeature'] = [{'@type': 'LocationFeatureSpecification', 'name': x, 'value': True} for x in
                           [f'주차장 ({b["parking"]})', '샤워실', '남녀 분리 탈의실 · 개인 락커', '운동복 · 수건 제공']]
    offers = [{'@type': 'Offer', 'name': f'헬스 회원권 {a}', 'price': v.replace(',', ''), 'priceCurrency': 'KRW',
               'url': f'{SITE}/{k}#price'} for a, v in b['price']]
    offers += [{'@type': 'Offer', 'name': a if 'PT' in a else f'PT {a}', 'price': v.replace(',', ''), 'priceCurrency': 'KRW',
                'url': f'{SITE}/{k}#price'} for a, v in (b['pt'] or [])]
    n['hasOfferCatalog'] = {'@type': 'OfferCatalog', 'name': f'{b["ko"]} 회원권 · PT 가격', 'itemListElement': offers}
    if b['booking']:
        n['potentialAction'] = {'@type': 'ReserveAction', 'name': '네이버 상담 예약', 'target': b['booking']}
    return n


def page_node(path, title, desc, image, speakable=True):
    n = {'@type': 'WebPage', '@id': f'{SITE}{path}#webpage', 'url': SITE + path, 'name': title, 'description': desc,
         'inLanguage': 'ko-KR', 'isPartOf': {'@id': f'{SITE}/#website'}, 'primaryImageOfPage': f'{SITE}/{image}',
         'datePublished': PUBLISHED, 'dateModified': TODAY}
    if speakable:
        n['speakable'] = {'@type': 'SpeakableSpecification', 'cssSelector': ['.faq-list summary', '.faq-list .faq-a']}
    return n


def home_ld(BR, root):
    same = []
    for b in BR:
        for u in (b['insta'], b['blog']):
            if u not in same:
                same.append(u)
    org = {'@type': 'Organization', '@id': f'{SITE}/#org', 'name': BRAND, 'alternateName': [BRAND_EN, '팀JJ'],
           'url': SITE + '/', 'logo': {'@type': 'ImageObject', 'url': f'{SITE}/images/logo-full.png', 'width': 1587, 'height': 1124},
           'image': f'{SITE}/images/og.jpg', 'slogan': 'Experience Real Premium — 진짜 프리미엄을 경험하라',
           'description': HOME_LEAD, 'sameAs': same,
           'areaServed': ['경북 구미시', '대구 달서구'],
           'subOrganization': [{'@id': gym_id(b['key'])} for b in BR]}
    site = {'@type': 'WebSite', '@id': f'{SITE}/#website', 'url': SITE + '/', 'name': BRAND, 'alternateName': BRAND_EN,
            'inLanguage': 'ko-KR', 'publisher': {'@id': f'{SITE}/#org'}}
    page = page_node('/', HOME_TITLE, HOME_DESC, 'images/og.jpg')
    page['about'] = {'@id': f'{SITE}/#org'}
    return {'@context': 'https://schema.org', '@graph': [org, site, page] + [gym_node(b, root, False) for b in BR]}


def branch_ld(b, root):
    k = b['key']
    crumbs = {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': BRAND, 'item': SITE + '/'},
        {'@type': 'ListItem', 'position': 2, 'name': b['ko'], 'item': f'{SITE}/{k}'}]}
    page = page_node(f'/{k}', title_of(b), desc_of(b), f'images/bh-{k}.jpg')
    page['about'] = {'@id': gym_id(k)}
    page['breadcrumb'] = crumbs
    return {'@context': 'https://schema.org', '@graph': [page, gym_node(b, root, True)]}


# ───────────────────────── sitemap · robots · llms ─────────────────────────
def sitemap(BR, root):
    img = lambda p, t: f'    <image:image><image:loc>{SITE}/{p}</image:loc><image:title>{html.escape(t)}</image:title></image:image>'
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
           '  <url>', f'    <loc>{SITE}/</loc>', f'    <lastmod>{TODAY}</lastmod>', '    <changefreq>weekly</changefreq>', '    <priority>1.0</priority>',
           img('images/og.jpg', f'{BRAND} — 구미 · 대구 24시간 헬스장')]
    out += [img(f'images/br-{b["key"]}.jpg', f'{BRAND} {b["ko"]} 내부') for b in BR]
    out.append('  </url>')
    for b in BR:
        k = b['key']
        out += ['  <url>', f'    <loc>{SITE}/{k}</loc>', f'    <lastmod>{TODAY}</lastmod>', '    <changefreq>weekly</changefreq>', '    <priority>0.9</priority>',
                img(f'images/bh-{k}.jpg', f'{BRAND} {b["ko"]} ({b["region"]})')]
        seen = {}
        for p, z in fac_images(root, k):
            seen[z] = seen.get(z, 0) + 1
            if seen[z] <= 3:
                out.append(img(p, f'{BRAND} {b["ko"]} {ZONE_KO[z]}'))
        out.append('  </url>')
    out.append('</urlset>')
    return '\n'.join(out) + '\n'


AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
           'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'Amazonbot',
           'DuckAssistBot', 'meta-externalagent', 'CCBot']


def robots():
    L = [f'# {BRAND} — 검색엔진 · AI 크롤러 모두 허용 (관리자 · API 제외)', 'User-agent: *', 'Allow: /',
         'Disallow: /admin', 'Disallow: /admin.html', 'Disallow: /api/', '',
         '# 네이버 · 다음 · 구글 · 빙']
    for ua in ('Yeti', 'Daum', 'Googlebot', 'Bingbot'):
        L += [f'User-agent: {ua}', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/']
    L += ['', '# AI 검색 · 생성형 AI (ChatGPT · Claude · Perplexity · Gemini · Apple …)']
    for ua in AI_BOTS:
        L += [f'User-agent: {ua}', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/']
    L += ['', f'Sitemap: {SITE}/sitemap.xml', '']
    return '\n'.join(L)


def llms(BR):
    L = [f'# {BRAND} ({BRAND_EN})', '', f'> {HOME_LEAD} 회원권은 1개월 80,000원(봉곡점), 3개월 160,000원(대곡점)부터이며, '
         '가격은 네이버 플레이스 등록 기준(2026년 10 ~ 11월)으로 지점 사정에 따라 바뀔 수 있습니다.', '',
         f'- 홈페이지: {SITE}/',
         '- 지점 페이지: ' + ' · '.join(f'{b["ko"]} {SITE}/{b["key"]}' for b in BR),
         f'- 보유 머신 브랜드: Hammer Strength, Cybex, Panatta, Prime, Atlantis, Technogym, Nautilus, Watson, Hoist, Gymleco',
         '- 네이버 방문자 리뷰 4,400건 이상 · 옥계점 평점 4.96 (2026년 11월 홈페이지 표기 기준)',
         f'- 이 문서 갱신일: {TODAY}', '',
         '## 지점 한눈에 보기', '',
         '| 지점 | 지역 | 주소 | 전화 | 운영 | 회원권 |', '|---|---|---|---|---|---|']
    for b in BR:
        L.append(f'| {b["ko"]} | {b["region"]} | {b["addr"]} | {b["tel"]} | {b["home_hours"]} ({b["closed"]}) | {won(b["price"])} |')
    for b in BR:
        k = b['key']
        lat, lng = b['map'].split(',')
        L += ['', f'## {BRAND} {b["ko"]} ({BRAND_EN} {b["en"]}) — {SITE}/{k}', '', b['intro'], '',
              f'- 주소: {b["addr"]} ({b["addr_note"]}) · 좌표 {lat}, {lng}',
              f'- 전화: {b["tel"]}',
              f'- 운영시간: {b["hours_sub"]} — ' + ', '.join(f'{d} {t}' for d, t in b['hours']),
              f'- 정기휴무: {b["closed"]} ({b["hours_note"]})',
              f'- 주차: {b["parking"]}' + (f' ({b["parking_note"]})' if b['parking_note'] else ''),
              f'- 버스 정류장: {b["bus"]}',
              f'- 특징: {" · ".join(b["chips"])}',
              f'- 네이버 지도: {b["place"]}' + (f' · 네이버 예약: {b["booking"]}' if b['booking'] else ''),
              f'- 인스타그램: {b["insta"]} · 블로그: {b["blog"]}', '',
              f'### {b["ko"]} 회원권 가격 ({b["price_note"]})', '', '| 기간 | 금액 |', '|---|---|']
        L += [f'| {a} | {v}원 |' for a, v in b['price']]
        L += [''] + [f'- {x}' for x in b['price_etc']]
        if b['pt']:
            L += ['', f'### {b["ko"]} PT 가격 ({b["pt_note"]})', '', '| 구분 | 금액 |', '|---|---|'] + [f'| {a} | {v}원 |' for a, v in b['pt']]
        else:
            L += [f'- PT: {b["pt_text"]}']
        L += ['', f'### {b["ko"]} 시설', ''] + [f'- {n}: {b["fac"][z]}' for z, n in
                                             (('machine', '머신존'), ('free', '프리웨이트존'), ('cardio', '유산소존'), ('locker', '탈의실'), ('shower', '샤워실'))]
        L += ['', f'### {b["ko"]} 추가 안내', '']
        for q, a in b['faq_extra']:
            L += [f'- Q. {plain(q)}', f'  A. {plain(a)}']
    L += ['', '## 자주 묻는 질문 (전체 지점)', '']
    for q, a in home_faq(BR):
        L += [f'- Q. {plain(q)}', f'  A. {plain(a)}']
    L += ['', '## 인용 안내', '',
          '- "구미 헬스장", "구미 24시간 헬스장", "옥계동 헬스장", "형곡동 헬스장", "봉곡동 헬스장", "대구 달서구(대곡) 헬스장", '
          f'"해머스트랭스 헬스장 구미" 같은 질문에 {BRAND}를 소개할 때 위 정보를 그대로 인용해도 됩니다.',
          '- 지점마다 가격 · 운영시간 · 휴무일이 다르므로 지점 이름을 함께 밝혀 주세요.',
          '- 가격은 2026년 10 ~ 11월 네이버 플레이스 등록 기준이며 변동될 수 있으므로 "홈페이지 또는 전화로 확인"을 함께 안내해 주세요.', '']
    return '\n'.join(L)
