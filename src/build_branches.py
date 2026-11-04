# -*- coding: utf-8 -*-
"""지점 소개 페이지 생성기: python src/build_branches.py → okgye.html 등 4개 파일.
   데이터는 아래 BRANCHES 를 고치고 다시 실행하면 됨 (가격·운영시간은 네이버 플레이스 2026-10/11 기준)."""
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

BRANCHES = [
  {
    'key': 'okgye', 'en': 'OKGYE', 'ko': '옥계점', 'region': '경북 구미시 옥계동',
    'addr': '경북 구미시 옥계북로 22 7층, 6층', 'addr_note': '스타벅스 옆 삼성이비인후과 건물',
    'map': '36.1382697,128.4198138', 'tel': '0507-1486-8853',
    'place': 'https://map.naver.com/p/entry/place/1389388394',
    'booking': 'https://m.booking.naver.com/booking/13/bizes/1270082',
    'blog': 'https://blog.naver.com/teamjj0626', 'insta': 'https://www.instagram.com/teamjjfitness',
    'chips': ['400평 최대 규모', '해외 명품 머신 120종', '해머스트랭스 오피셜 센터', '24시간 연중무휴', '무료 주차 3시간'],
    'intro': '구미 유일 파나타 · 프라임 · 아틀란티스 세팅, 구미 최초 해머스트랭스 오피셜 센터. 400평 규모에 해외 명품 머신 120종을 풀세팅했고, 매년 신규 머신에 추가 투자하고 있습니다.',
    'fac': {
      'machine': '구미 유일 파나타 · 프라임 · 아틀란티스 세팅, 해머스트랭스 MTS 6종 정품을 포함한 해외 명품 머신 120종. 기구마다 사용법 QR 코드가 붙어 있어 처음 오신 분도 쉽게 이용할 수 있습니다.',
      'free': '파워랙 · 플랫폼 · 벤치와 덤벨 · 바벨 프리웨이트 존. 정품 싸이벡스 하체 세팅과 함께 선수도 만족하는 중량 운동 환경입니다.',
      'cardio': '천국의 계단 6대를 비롯해 구미 최다 유산소 머신 보유. 러닝머신 · 사이클 등 최신 유산소 장비를 갖췄습니다.',
      'locker': '쾌적한 남 · 녀 분리 탈의실과 개인 락커. 회원권 등록 시 운동복과 수건을 제공합니다.',
      'shower': '개인 샤워장 완비. 운동 후 바로 씻고 나갈 수 있는 깔끔한 샤워 환경입니다.',
    },
    'price_note': '운동복 + 수건 이벤트 · 부가세 별도 · 대학생 상시 할인',
    'price': [('3개월', '200,000'), ('6개월', '330,000'), ('12개월', '550,000')],
    'price_etc': ['가격은 네이버 플레이스 등록 기준(2026년 10월)이며 지점 사정에 따라 바뀔 수 있습니다.', '대학생 할인 · 재등록 · 이벤트 가격은 센터로 문의해 주세요.'],
    'pt': None,
    'pt_text': '최고 권위 단체 1등 출신 선수가 직접 트레이닝. 재활 · 다이어트 · 선수 트레이닝 모두 가능하며, PT 가격은 상담 시 안내해 드립니다.',
    'hours_big': '24 HOURS', 'hours_sub': '연중무휴 24시간 운영',
    'hours': [('월 ~ 금', '00:00 ~ 24:00'), ('토요일', '00:00 ~ 24:00'), ('일요일', '00:00 ~ 24:00')],
    'closed': '매달 넷째 주 일요일 정기 휴무', 'hours_note': '정기휴무 전날 토요일 21시 마감, 월요일 06시 오픈',
    'parking': '전용 주차장 3시간 무료', 'parking_note': "산호대로29길 9, 빅마트 옆 '옥계 쿨스파' 건물",
    'bus': '삼구트리니엔건너(도보 1분) · 양포도서관건너(도보 4분)',
  },
  {
    'key': 'daegok', 'en': 'DAEGOK', 'ko': '대곡점', 'region': '대구 달서구 도원동',
    'addr': '대구 달서구 도원로 36 2층', 'addr_note': '홈플러스 익스프레스 건물',
    'map': '35.8064956,128.5352668', 'tel': '0507-1395-0089',
    'place': 'https://map.naver.com/p/entry/place/1512343495',
    'booking': None,
    'blog': 'https://blog.naver.com/teamjj_daegok', 'insta': 'https://www.instagram.com/teamjjfitness_daegok',
    'chips': ['달서구 최대 500평', '수입 명품 머신 120종', '천국의 계단 4대 · 파워랙 8대', '24시간 연중무휴', '주차 100대 3시간 무료'],
    'intro': '달서구 최대 500평, 기구 투자 8억. 100% 정품 수입 명품 머신 120종을 세팅했고, 세스코와 전문 청소업체가 관리하는 쾌적한 환경을 유지합니다.',
    'fac': {
      'machine': '해머스트랭스 · 싸이벡스 · 테크노짐 · 왓슨 · 아스날 · 호이스트 · 파나타 · 프라임 · 아틀란티스 · 부티빌더 · 프리코 등 수입 명품 머신 120종. 기구 사용법을 친절히 안내해 드립니다.',
      'free': '파워랙 8대와 넉넉한 덤벨 · 바벨 존. 붐비는 시간에도 기다리지 않고 프리웨이트 운동을 할 수 있습니다.',
      'cardio': '천국의 계단 4대와 최신 유산소 머신 완비. 러닝머신 · 사이클 · 일립티컬을 갖췄습니다.',
      'locker': '넓은 남 · 녀 분리 탈의실과 개인 락커. 회원권에 운동복과 수건이 포함됩니다.',
      'shower': '샤워장 완비. 세스코 + 전문 청소업체가 관리하는 깨끗한 샤워 환경입니다.',
    },
    'price_note': '운동복 + 수건 포함 · 회원가입 시 PT 증정',
    'price': [('3개월', '160,000'), ('6개월', '260,000'), ('12개월', '360,000')],
    'price_etc': ['가격은 네이버 플레이스 등록 기준(2026년 10월)이며 지점 사정에 따라 바뀔 수 있습니다.', '회원권 · 일일권 등록 가능 시간: 평일 07시 ~ 24시, 주말 12시 ~ 20시'],
    'pt': None,
    'pt_text': 'PRO 선수의 PT를 경험하세요. 회원가입 시 PT를 증정하며, PT 가격은 상담 시 안내해 드립니다.',
    'hours_big': '24 HOURS', 'hours_sub': '연중무휴 24시간 운영',
    'hours': [('월 ~ 금', '00:00 ~ 24:00'), ('토요일', '00:00 ~ 24:00'), ('일요일', '00:00 ~ 24:00')],
    'closed': '매달 넷째 주 일요일 정기 휴무', 'hours_note': '정기휴무 전날 토요일 20시 마감, 월요일 06시 오픈 · 등록 가능 시간 평일 07~24시, 주말 12~20시',
    'parking': '건물 뒤 자체 주차장 100대, 3시간 무료', 'parking_note': '자리가 없으면 센터로 전화 주시면 전용 주차장을 안내해 드립니다',
    'bus': '대곡강산타운건너(도보 2분) · 대곡중학교앞(도보 3분)',
  },
  {
    'key': 'hyeonggok', 'en': 'HYEONGGOK', 'ko': '형곡점', 'region': '경북 구미시 형곡동',
    'addr': '경북 구미시 신시로7길 12-12 3층 301호', 'addr_note': '미르치과 뒤 (구)형곡온천 건물',
    'map': '36.1138071,128.3383624', 'tel': '0507-1381-6729',
    'place': 'https://map.naver.com/p/entry/place/2090786952',
    'booking': 'https://m.booking.naver.com/booking/13/bizes/1446148',
    'blog': 'https://blog.naver.com/teamjj0428', 'insta': 'https://www.instagram.com/teamjjfitness',
    'chips': ['형곡동 최대 400평', '수입 명품 머신 100종', '천국의 계단 4대', '평일 24시간', '기구마다 사용법 QR'],
    'intro': '형곡동 최대 규모 400평. 해머스트랭스 · 프라임 · 테크노짐 · 너틸러스 · 아스널 · 싸이벡스 · 온힘 · 호이스트 · 라이프피트니스 등 수입 명품 머신 100종과 천국의 계단 4대를 갖췄습니다.',
    'fac': {
      'machine': '해머스트랭스 · 프라임 · 테크노짐 · 너틸러스 · 아스널 · 싸이벡스 · 호이스트 · 라이프피트니스 등 수입 명품 머신 100종. 기구마다 사용법 QR 코드가 붙어 있습니다.',
      'free': '파워랙 · 플랫폼 · 벤치와 덤벨 · 바벨 프리웨이트 존. 해머스트랭스 플레이트 로디드 머신과 함께 중량 운동에 집중할 수 있습니다.',
      'cardio': '천국의 계단 4대와 러닝머신 · 사이클 등 유산소 머신을 넉넉히 갖췄습니다.',
      'locker': '세스코 살균 케어 안심존. 남 · 녀 분리 탈의실과 개인 락커, 운동복과 수건을 제공합니다.',
      'shower': '샤워실 완비. 세스코 살균 케어로 관리하는 깨끗한 샤워 환경입니다.',
    },
    'price_note': '운동복 + 수건 무료 이벤트 · 일일권 22,000원',
    'price': [('1개월', '130,000'), ('3개월', '200,000'), ('6개월', '330,000'), ('12개월', '550,000')],
    'price_etc': ['가격은 네이버 플레이스 등록 기준(2026년 10월)이며 지점 사정에 따라 바뀔 수 있습니다.', '일일권 22,000원 · 연휴 기간 일일권 할인 이벤트는 블로그와 네이버 소식에서 안내합니다.'],
    'pt': None,
    'pt_text': '극강의 PT 퀄리티 책임 보장. PT 가격은 상담 시 안내해 드립니다.',
    'hours_big': '24 HOURS', 'hours_sub': '평일 24시간 운영',
    'hours': [('월 ~ 금', '00:00 ~ 24:00'), ('토요일', '00:00 ~ 21:00'), ('일요일', '휴무')],
    'closed': '매주 일요일 정기 휴무', 'hours_note': '토요일 21시 마감, 월요일 06시 오픈',
    'parking': '건물 1층 전용 주차장', 'parking_note': '만차 시 중앙도서관 · 공원 주변 이면도로 이용',
    'bus': '형곡4주공네거리(도보 3분) · 차병원건너(도보 7분)',
  },
  {
    'key': 'bonggok', 'en': 'BONGGOK', 'ko': '봉곡점', 'region': '경북 구미시 봉곡동',
    'addr': '경북 구미시 봉곡남로 103 2층', 'addr_note': '봉곡동 테마공원 옆 새마을금고 건물',
    'map': '36.1499834,128.3132494', 'tel': '0507-1385-0910',
    'place': 'https://map.naver.com/p/entry/place/1848533333',
    'booking': 'https://m.booking.naver.com/booking/13/bizes/800549',
    'blog': 'https://blog.naver.com/hsbea', 'insta': 'https://www.instagram.com/teamjjfitness_bonggok',
    'chips': ['봉곡동 유일 해외 명품 머신', '해머스트렝스 · 라이프피트니스 · 싸이벡스', '보디빌딩식 PT', '월 08시 ~ 토 20시 24시간', '방문자 리뷰 평점 5.0'],
    'intro': '봉곡동에서 유일하게 고가의 수입 머신을 세팅한 센터. 가성비가 아니라 운동이 잘 되는 기구만 골라 계속 교체 · 입고하고 있으며, 수업이 끝난 뒤 혼자서도 운동할 수 있게 기초부터 가르치는 보디빌딩식 PT로 지인 소개가 끊이지 않습니다.',
    'fac': {
      'machine': '해머스트렝스 · 라이프피트니스 · 싸이벡스 · 너틸러스 · 부티빌더 등 해외 명품 머신. 운동감 유지에 신경 써 관리하며, 신규 머신을 계속 교체 · 입고합니다.',
      'free': '파워랙 · 스미스머신 · 벤치와 덤벨 · 바벨 프리웨이트 존. 보디빌딩식 중량 운동을 제대로 배울 수 있는 공간입니다.',
      'cardio': '러닝머신 · 사이클 등 유산소 머신 존. 근력 운동 뒤 마무리 유산소까지 한 곳에서.',
      'locker': '남 · 녀 분리 탈의실과 개인 락커. 회원권에 운동복과 수건이 포함됩니다.',
      'shower': '샤워장 완비. "팀JJ 하면 청결"이 떠오를 만큼 매일 쓸고 닦는 깨끗한 환경입니다.',
    },
    'price_note': '운동복 + 수건 포함 · 대학생 3개월 150,000원 (학생증 지참)',
    'price': [('1개월', '80,000'), ('3개월', '170,000'), ('6개월', '300,000')],
    'price_etc': ['가격은 네이버 플레이스 등록 기준(2026년 11월)이며 지점 사정에 따라 바뀔 수 있습니다.', '회원권은 상담 예약 없이 방문하시면 언제든 등록할 수 있습니다.'],
    'pt': [('체험 레슨', '30,000'), ('PT 8회', '400,000'), ('PT 16회', '720,000'), ('PT 24회', '960,000')],
    'pt_note': '체험 레슨 50분 · 1회 한정 50% 할인 이벤트',
    'pt_text': None,
    'hours_big': '24 HOURS', 'hours_sub': '월요일 08시 ~ 토요일 20시 24시간 운영',
    'hours': [('월 ~ 금', '00:00 ~ 24:00'), ('토요일', '00:00 ~ 20:00'), ('일요일', '휴무')],
    'closed': '매주 일요일 정기 휴무', 'hours_note': '토요일 20시 마감, 월요일 08시 오픈',
    'parking': '건물 뒤편 주차장', 'parking_note': '',
    'bus': '봉곡동대구은행앞(도보 1분) · 봉곡동대구은행건너(도보 2분)',
  },
]

ZONES = [
  ('machine', '머신존', 'MACHINE ZONE', 'big'),
  ('free',    '프리웨이트존', 'FREE WEIGHT', 'big'),
  ('cardio',  '유산소존', 'CARDIO', 'small'),
  ('locker',  '탈의실', 'LOCKER ROOM', 'small'),
  ('shower',  '샤워장', 'SHOWER', 'small'),
]
PH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5l1.2-2h5.6L16 5"/></svg>'

INSTA_SVG = '<svg class="ico-line" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle class="dot" cx="17.3" cy="6.7" r="1"/></svg>'
BLOG_SVG = '<svg viewBox="0 0 24 24"><path d="M4 3h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-5l-3 4-3-4H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3.2 4.5v6h2.3c1.3 0 2-.6 2-1.6 0-.7-.4-1.1-1-1.3.5-.2.8-.6.8-1.2 0-1-.7-1.5-1.9-1.5Zm1.3 1h.8c.5 0 .7.2.7.6s-.3.6-.7.6h-.8Zm0 2.2h1c.5 0 .8.2.8.7s-.3.6-.8.6h-1Zm4.6-3.2v6h1.3V7.5Z"/></svg>'


def tel_href(t):
    return 'tel:' + t.replace('-', '')


def price_ul(rows):
    return '<ul>' + ''.join(f'<li><span>{a}</span><b>{b}</b></li>' for a, b in rows) + '</ul>'



KAKAO_FAB_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.7 6.6l-1 3.7c-.1.3.3.6.5.4l4.3-2.9c.5.1 1 .1 1.5.1 5.5 0 10-3.5 10-7.9S17.5 3 12 3Z"/></svg>'
INSTA_FAB_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 2.2c-2.7 0-3 0-4 .1-1.1 0-1.8.2-2.4.5a4.9 4.9 0 0 0-1.8 1.1A4.9 4.9 0 0 0 2.7 5.7c-.3.6-.4 1.3-.5 2.4 0 1-.1 1.3-.1 4s0 3 .1 4c0 1.1.2 1.8.5 2.4.2.7.6 1.2 1.1 1.8.6.5 1.1.9 1.8 1.1.6.3 1.3.4 2.4.5 1 0 1.3.1 4 .1s3 0 4-.1c1.1 0 1.8-.2 2.4-.5a4.9 4.9 0 0 0 1.8-1.1c.5-.6.9-1.1 1.1-1.8.3-.6.4-1.3.5-2.4 0-1 .1-1.3.1-4s0-3-.1-4c0-1.1-.2-1.8-.5-2.4a4.9 4.9 0 0 0-1.1-1.8 4.9 4.9 0 0 0-1.8-1.1c-.6-.3-1.3-.4-2.4-.5-1 0-1.3-.1-4-.1Zm0 1.8c2.7 0 3 0 4 .1 1 0 1.5.2 1.8.3.5.2.8.4 1.1.7.3.3.6.7.7 1.1.1.3.3.9.3 1.8.1 1.1.1 1.4.1 4s0 3-.1 4c0 1-.2 1.5-.3 1.8-.2.5-.4.8-.7 1.1-.3.3-.7.6-1.1.7-.3.1-.9.3-1.8.3-1.1.1-1.4.1-4 .1s-3 0-4-.1c-1 0-1.5-.2-1.8-.3-.5-.2-.8-.4-1.1-.7a3 3 0 0 1-.7-1.1c-.1-.3-.3-.9-.3-1.8C4 15 4 14.7 4 12s0-3 .1-4c0-1 .2-1.5.3-1.8.2-.5.4-.8.7-1.1.3-.3.7-.6 1.1-.7.3-.1.9-.3 1.8-.3C9 4 9.3 4 12 4Z"/></svg>'
TEL_FAB_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/></svg>'

def fab_html(b):
    """우측 하단 플로팅 버튼 (카톡·인스타·전화). 카톡 주소는 js/fab.js 의 KAKAO_URL 에서 설정."""
    tel = tel_href(b['tel'])
    return (f'<div class="fab" id="fab" aria-label="빠른 연락">'
            f'  <a class="fab-btn fab-kakao" href="{tel}" aria-label="카카오톡 상담">{KAKAO_FAB_SVG}</a>'
            f'  <a class="fab-btn fab-insta" href="{b["insta"]}" target="_blank" rel="noopener" aria-label="인스타그램">{INSTA_FAB_SVG}</a>'
            f'  <a class="fab-btn fab-tel" href="{tel}" aria-label="전화 상담">{TEL_FAB_SVG}</a>'
            f'</div>')


def build(b):
    k = b['key']
    cta = b['booking'] or tel_href(b['tel'])
    cta_blank = ' target="_blank" rel="noopener"' if b['booking'] else ''

    # 시설
    facs = []
    for i, (zk, ko, en, size) in enumerate(ZONES, 1):
        img = f'images/fac/{k}-{zk}.jpg'
        if os.path.exists(os.path.join(ROOT, img)):
            media = f'<img src="{img}" alt="팀JJ피트니스 {b["ko"]} {ko}" loading="lazy">'
        else:
            media = f'<div class="fac-ph">{PH_ICON}<span>사진 준비 중</span></div>'
        facs.append(
            f'<figure class="fac {size} rv"><span class="fac-num">0{i}</span>'
            f'<div class="fac-img">{media}</div>'
            f'<figcaption><b>{ko}<em>{en}</em></b><p>{b["fac"][zk]}</p></figcaption></figure>')

    # 가격
    price_html = (
        f'<div class="price"><p class="price-tit">MEMBERSHIP <em>{b["price_note"]}</em></p>{price_ul(b["price"])}'
        f'<ul class="price-note">{"".join(f"<li>{x}</li>" for x in b["price_etc"])}</ul></div>')
    if b['pt']:
        price_html += (
            f'<div class="price"><p class="price-tit">PERSONAL TRAINING <em>{b["pt_note"]}</em></p>{price_ul(b["pt"])}'
            f'<ul class="price-note"><li>예약하기 → 스케줄 조율 → 체험비 입금 → 예약 확정 → 레슨 진행</li></ul></div>')
    else:
        price_html += (
            f'<div class="pt-cta"><div><b>PERSONAL TRAINING</b><p>{b["pt_text"]}</p></div>'
            f'<a class="btn red" href="{cta}"{cta_blank}>PT 상담 예약</a></div>')

    # 운영시간
    hours_li = ''.join(
        f'<li class="{"off" if t == "휴무" else ""}"><span>{d}</span><b>{t}</b></li>' for d, t in b['hours'])
    btns = []
    if b['booking']:
        btns.append(f'<a class="btn red" href="{b["booking"]}" target="_blank" rel="noopener">네이버 상담 예약</a>')
        btns.append(f'<a class="btn" href="{tel_href(b["tel"])}">전화하기</a>')
    else:
        btns.append(f'<a class="btn red" href="{tel_href(b["tel"])}">전화 상담</a>')
    btns.append(f'<a class="btn" href="{b["place"]}" target="_blank" rel="noopener">네이버 지도</a>')
    btns.append(f'<a class="btn" href="{b["insta"]}" target="_blank" rel="noopener">인스타그램</a>')
    btns.append(f'<a class="btn" href="{b["blog"]}" target="_blank" rel="noopener">블로그</a>')
    parking_note = f'<br><em>{b["parking_note"]}</em>' if b['parking_note'] else ''

    # 다른 지점
    others = ''.join(
        f'<a class="bcircle" href="{o["key"]}.html"><span class="bc-img"><img src="images/br-{o["key"]}.jpg" alt="" loading="lazy"></span>'
        f'<span class="bc-txt"><strong>{o["en"]}</strong><b>{o["ko"]}</b><small>{o["region"]}</small></span></a>'
        for o in BRANCHES if o['key'] != k)

    chips = ''.join(f'<li>{c}</li>' for c in b['chips'])
    desc = f'팀JJ피트니스 {b["ko"]} 시설안내 · 가격안내 · 운영시간. {b["addr"]}, {b["tel"]}.'

    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{b['ko']} | 팀JJ피트니스 TEAM JJ FITNESS {b['en']}</title>
<meta name="description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:title" content="팀JJ피트니스 {b['ko']} | TEAM JJ FITNESS {b['en']}">
<meta property="og:description" content="{b['intro']}">
<meta property="og:image" content="images/bh-{k}.jpg">
<link rel="icon" href="images/logo-full.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,500;0,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="hd" id="top">
  <a class="hd-logo" href="index.html" aria-label="팀JJ피트니스 홈"><img src="images/logo-word.png" alt="TEAM JJ FITNESS"></a>
  <nav class="hd-nav" id="nav">
    <a href="index.html">홈</a>
    <a href="index.html#branches">지점 소개</a>
    <a href="#facility">시설안내</a>
    <a href="#price">가격안내</a>
    <a href="#hours">운영시간</a>
  </nav>
  <button class="hd-burger" id="burger" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span></button>
</header>

<main>
  <section class="bhero" style="background-image:url(images/bh-{k}.jpg)" aria-label="{b['ko']} 소개">
    <div class="bhero-in">
      <p class="bhero-eyebrow">TEAM JJ FITNESS</p>
      <h1 class="bhero-tit">{b['en']}</h1>
      <p class="bhero-sub">팀JJ피트니스 {b['ko']}<small>{b['addr']} · {b['addr_note']}</small></p>
      <ul class="bhero-chips">{chips}</ul>
    </div>
  </section>

  <nav class="subnav" aria-label="{b['ko']} 페이지 내 이동">
    <div class="subnav-in">
      <a href="#facility" data-sub="facility">시설안내</a>
      <a href="#price" data-sub="price">가격안내</a>
      <a href="#hours" data-sub="hours">운영시간</a>
      <a class="home" href="index.html#branches">← ALL BRANCHES</a>
    </div>
  </nav>

  <!-- 시설안내 -->
  <section class="bsec" id="facility" aria-labelledby="facTit">
    <div class="bsec-head">
      <h2 class="big-tit" id="facTit">FACILITIES</h2>
      <p>{b['intro']}</p>
    </div>
    <div class="fac-grid">
      {''.join(facs)}
    </div>
  </section>

  <!-- 가격안내 -->
  <section class="bsec" id="price" aria-labelledby="priceTit">
    <div class="bsec-head">
      <h2 class="big-tit" id="priceTit">PRICE</h2>
      <p>{b['ko']} 회원권 가격 안내입니다. 모든 회원권에 운동복과 수건이 포함되며, 자세한 상담은 전화 또는 네이버 예약으로 문의해 주세요.</p>
    </div>
    <div class="price-wrap">
      {price_html}
    </div>
  </section>

  <!-- 운영시간 -->
  <section class="bsec" id="hours" aria-labelledby="hoursTit">
    <div class="bsec-head">
      <h2 class="big-tit" id="hoursTit">HOURS &amp;<br>LOCATION</h2>
      <p>{b['ko']} 운영시간과 오시는 길, 주차 안내입니다.</p>
    </div>
    <div class="hours-wrap">
      <div>
        <p class="hours-big">{b['hours_big']}<small>{b['hours_sub']}</small></p>
        <ul class="hours-table">
          {hours_li}
          <li class="off"><span>정기휴무</span><b>{b['closed']}</b></li>
        </ul>
        <p class="hours-note">{b['hours_note']}</p>
      </div>
      <div class="hours-side">
        <div class="panel-map" data-map="{b['map']}" data-name="팀JJ피트니스 {b['ko']}"></div>
        <dl class="panel-info">
          <div><dt>주소</dt><dd>{b['addr']}<br><em>{b['addr_note']}</em></dd></div>
          <div><dt>주차</dt><dd>{b['parking']}{parking_note}</dd></div>
          <div><dt>대중교통</dt><dd><em>{b['bus']}</em></dd></div>
          <div><dt>전화</dt><dd><a href="{tel_href(b['tel'])}">{b['tel']}</a></dd></div>
        </dl>
        <div class="panel-btns">{''.join(btns)}</div>
      </div>
    </div>
  </section>

  <!-- 다른 지점 -->
  <section class="others" aria-label="다른 지점">
    <div class="others-in">
      <h2 class="big-tit">OTHER BRANCHES</h2>
      <div class="bc-grid">{others}</div>
    </div>
  </section>
</main>

<footer class="ft">
  <div class="ft-top">
    <div class="ft-brand">
      <img src="images/logo-word.png" alt="TEAM JJ FITNESS">
      <div class="ft-sns">
        <a href="{b['insta']}" target="_blank" rel="noopener" aria-label="인스타그램">{INSTA_SVG}</a>
        <a href="{b['blog']}" target="_blank" rel="noopener" aria-label="네이버 블로그">{BLOG_SVG}</a>
      </div>
    </div>
    <div class="ft-cols">
      <div>
        <p class="ft-h">팀JJ피트니스 지점</p>
        <ul class="ft-list">
          <li><a href="okgye.html">옥계점</a><span>경북 구미시 옥계북로 22 · 0507-1486-8853</span></li>
          <li><a href="daegok.html">대곡점</a><span>대구 달서구 도원로 36 · 0507-1395-0089</span></li>
          <li><a href="hyeonggok.html">형곡점</a><span>경북 구미시 신시로7길 12-12 · 0507-1381-6729</span></li>
          <li><a href="bonggok.html">봉곡점</a><span>경북 구미시 봉곡남로 103 · 0507-1385-0910</span></li>
        </ul>
      </div>
    </div>
  </div>
  <p class="ft-copy">팀JJ피트니스 · TEAM JJ FITNESS · 가격과 운영시간은 지점 사정에 따라 바뀔 수 있습니다. &copy; 2026 TEAM JJ FITNESS</p>
  <nav class="ft-bar" aria-label="바로가기">
    <a href="okgye.html">옥계점</a>
    <a href="daegok.html">대곡점</a>
    <a href="hyeonggok.html">형곡점</a>
    <a href="bonggok.html">봉곡점</a>
    <a href="{b['insta']}" target="_blank" rel="noopener">인스타그램</a>
    <a href="{cta}"{cta_blank}>상담 예약</a>
  </nav>
  <div class="ft-giant" aria-hidden="true"><span>TEAM JJ</span></div>
</footer>

{fab_html(b)}
<script src="js/branch.js"></script>
<script src="js/fab.js"></script>
</body>
</html>
'''


if __name__ == '__main__':
    for b in BRANCHES:
        path = os.path.join(ROOT, b['key'] + '.html')
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(build(b))
        print('wrote', b['key'] + '.html')
