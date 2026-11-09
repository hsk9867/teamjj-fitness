# 팀JJ피트니스 배포 — Cloudflare Workers(정적 + D1) + 호스팅케이알 도메인(teamjjfitness.co.kr)

| 역할 | 서비스 | 비용 |
|---|---|---|
| 홈페이지 파일(HTML·CSS·JS·사진) | Cloudflare Workers Static Assets | 무료 |
| 관리자 API · 방문 기록 · 올린 사진 | Workers(`worker.js`) + D1(`teamjj-db`) | 무료 (D1 5GB, 하루 10만 요청) |
| 도메인 teamjjfitness.co.kr | 호스팅케이알 구매 → 네임서버를 Cloudflare 로 | 도메인 비용만 |

Cloudflare 계정: hsk9867@gmail.com (홍스랩 계정). 라이칸짐(`~/lycangym`)과 같은 구조입니다.
사진은 R2 없이 D1 BLOB 에 저장합니다(올릴 때 브라우저에서 줄여 보통 200~400KB).

## 처음 한 번 (이미 완료한 것, 2026-11-09)
- `npx wrangler d1 create teamjj-db` → `wrangler.jsonc` 의 database_id
- `npx wrangler d1 migrations apply teamjj-db --remote` → settings/content/visits/files 테이블
- `npx wrangler deploy` → https://teamjj-fitness.hsk9867.workers.dev
- 관리자 첫 비밀번호 등록 (바탕화면 `팀JJ피트니스 관리자 비밀번호.txt`)

## 파일을 고친 뒤
```powershell
cd C:\Users\홍아름\teamjj-fitness
python src\build_branches.py   # 지점 데이터(BRANCHES)를 고쳤을 때만
npx wrangler deploy
```
GitHub 푸시만으로는 실제 사이트에 반영되지 않습니다(GitHub Pages 미리보기 hsk9867.github.io/teamjj-fitness 는 별개이고, 거기서는 관리자·통계가 동작하지 않습니다).

## 도메인 연결 (호스팅케이알 → Cloudflare)
- 2026-11-09 완료한 것: Cloudflare 존 `teamjjfitness.co.kr`(Free) 생성, `wrangler.jsonc` routes 로 apex·www 커스텀 도메인 연결(DNS 레코드·인증서 자동).
  - 대시보드 "Connect a domain" 양식은 .co.kr 에서 멈춘다(등록 가능 여부 확인 API 가 422 를 돌려주는데 화면이 처리하지 못함). 그래서 로그인된 대시보드 세션에서 `POST /api/v4/zones` 로 만들었다.
- **남은 일(도메인 소유자가 직접)**: 호스팅케이알(app.hosting.kr) 로그인 → 도메인 → `teamjjfitness.co.kr` → 도메인 정보 → 네임서버 편집 → "사용자 정의" 로 아래 2개만 입력(빈 행은 삭제) → 저장.
  - `patrick.ns.cloudflare.com`
  - `val.ns.cloudflare.com`
- 반영(수 분~수 시간) 후 Cloudflare 존이 Active 가 되면 https://teamjjfitness.co.kr 이 바로 열린다. 다시 deploy 할 필요 없음.
- 검색 등록(네이버 서치어드바이저·구글 서치콘솔)은 `https://teamjjfitness.co.kr/` 로, 소유 확인은 **메타태그** 방식(Cloudflare 가 `/x.html` 을 `/x` 로 리디렉트해 HTML 파일 방식은 실패). `sitemap.xml`, `robots.txt` 는 이미 있습니다.

## 관리자 (`/admin`)
- 화면 틀과 방문자 통계 대시보드는 라이칸짐 관리자(lycangym.hsk9867.workers.dev/admin, 2026-11-09 라이브본)와 같은 구성이다. 왼쪽 메뉴 + 밝은/어두운 화면 자동.
- 비밀번호 로그인(4자 이상, PBKDF2 해시를 D1 에 저장, wrangler secret 불필요). 5회 실패 시 10분 잠금. 변경은 설정 메뉴.
- 메뉴
  - **대시보드(방문자 통계)**: 기간 선택(오늘·7일·30일·90일·직접), 지금 접속, 방문·순방문자·페이지뷰·연락 액션, 평균 머문 시간·스크롤 깊이·이탈률·연락 전환율(이전 같은 기간과 비교), 일별/시간대별 추이, 유입경로, 방문→연락 퍼널, 요일×시간대 히트맵, 연락 액션, 유입경로별 전환, 많이 본 페이지, 첫 방문 페이지, 유입 상세, 캠페인(UTM), 기기·브라우저·OS·지역·화면 크기·언어, 최근 활동
  - **메인 문구**: 메인 제목·소개 문구, 카카오톡 채널 주소(오른쪽 아래 카톡 버튼), 대표 인스타·블로그
  - **지점 정보 · 가격**: 지점별 회원권 가격표, PT 가격표, 요일별 운영시간, 주소·전화·주차·대중교통, 강조 칩, 메인 카드 문구, 예약·지도·SNS 링크, 지점 카카오톡 채널, 대표 사진 2장
  - **회원 후기** · **메인 사진**(첫 화면 슬라이드, 시설 사진 띠, 비포애프터) · **지점 시설 사진**(지점별 4개 존)
  - **설정**: 비밀번호 변경, 방문 기록 CSV 내보내기, 홍보 링크(UTM) 만들기, 저장 상태
- 저장하면 고객 화면은 새로고침 때 반영(최대 30초 캐시). "원래대로" 는 HTML 기본값으로 복귀. 문구에서 `**단어**` 는 빨간 글자.
- 비밀번호를 잊으면: `npx wrangler d1 execute teamjj-db --remote --command "DELETE FROM settings WHERE key='auth'"` → /admin 에서 다시 설정(지우는 즉시 바로 설정할 것).

## 방문 통계가 세는 것
- `js/track.js` → `POST /api/track` → D1 `hits` (migrations/0002_hits.sql). 개인정보 없음(무작위 브라우저 ID, 페이지, 유입 주소, 기기 종류, 도시).
- view: 페이지 열람(새로고침 제외) · event: tel(전화) · kakao · booking(네이버 예약) · insta · blog · map · price(가격표가 화면에 1초 이상 보임) · leave: 화면에 보인 시간과 스크롤 깊이(열람 1회당 한 줄).
- 연락 액션 = tel · kakao · booking. 방문 = 같은 사람·같은 날 1회. 관리자로 로그인한 브라우저와 검색엔진 봇은 세지 않는다.
- 유입경로는 그 방문(탭)의 첫 페이지에서 정해 사이트 안에서 이동해도 유지한다(sessionStorage).
- D1 은 UNION 을 5개까지만 허용한다(통계 쿼리를 고칠 때 주의). 예전 `visits` 테이블은 더 쓰지 않는다.

## 검색 · AI 노출 (SEO · AEO · GEO, 2026-11-09)

원본 데이터는 `src/build_branches.py` 의 `BRANCHES` 한 곳이고, `src/seo.py` 가 거기서 아래를 모두 만든다. **가격 · 주소 · 전화 · 운영시간을 바꾸면 `python src/build_branches.py` → `npx wrangler deploy`.**

- 페이지마다: 제목 · 설명 · 키워드 · canonical · OG/트위터 카드 · 지역 메타(지점 페이지는 좌표) · 첫 화면 사진 preload
- 구조화 데이터(JSON-LD): 메인 `#ld-main` = Organization + WebSite + WebPage + 지점 4곳 HealthClub 요약, 지점 페이지 `#ld-main` = WebPage(BreadcrumbList) + HealthClub(주소 · 좌표 · 전화 · 영업시간 · 회원권/PT Offer · 네이버 예약), 모든 페이지 `#ld-faq` = FAQPage. 후기 평점(aggregateRating)은 네이버 리뷰라서 넣지 않았다(구글 정책: 다른 사이트에서 가져온 평점 금지)
- 자주 묻는 질문: 메인 8개 + 지점마다 8개(화면에 보이는 `.faq-list`). 답변 안의 주소 · 주차 · 휴무 · 가격은 지점 정보 칸과 연결돼 있어 관리자에서 바꾸면 같이 바뀐다. 관리자에서 답변을 직접 고쳐 쓰면 그 답변은 자동 연결이 끊긴다
- `robots.txt`(검색 · AI 크롤러 이름별 허용), `sitemap.xml`(5개 페이지 + 사진), `llms.txt`(AI 가 읽는 소개문: 지점 표 · 가격표 · 시설 · FAQ)
- `index.html` 은 `<!-- SEO:HEAD -->` `<!-- SEO:LD -->` `<!-- SEO:FAQ -->` 표시 사이만 스크립트가 다시 쓴다. 그 사이는 손으로 고치지 말 것
- 내부 링크는 `.html` 없이 쓴다(`okgye`, `./`). `/okgye.html` 은 Cloudflare 가 `/okgye` 로 한 번 넘기기 때문
- `_headers`: `/images/*` 를 7일 브라우저 캐시. 같은 파일 이름으로 사진을 바꿔 올리면 다시 온 방문자에겐 최대 7일 뒤에 바뀐다 → 이름을 바꿔 올릴 것
- 관리자에서 바꾼 값은 `js/cms.js` 가 화면과 JSON-LD 에 반영한다(구글은 스크립트를 실행하므로 반영됨). **`llms.txt` 와 원본 HTML 은 그대로**라서 스크립트를 실행하지 않는 AI 크롤러는 `BRANCHES` 기본값을 본다 → 가격을 바꾸면 `BRANCHES` 도 고쳐 다시 배포
- 점검: 관리자 > 검색·AI 노출. 검색 등록(네이버 서치어드바이저 · 구글 서치콘솔) 소유 확인 태그는 `src/seo.py` 의 `VERIFY` 에 넣는다

## 구조 메모
- `js/cms.js` 가 `<head>` 에서 `/api/content` 를 받아 `data-cms`(문구) · `data-cms-href`(링크) · `data-cms-bg`(배경 사진) · `data-cms-price` / `data-cms-pt`(가격표) · `data-cms-hours`(운영시간표) · `#revTrack` `#baTrack` `#heroSlides` `#fastA/B` · `.zone[data-zone]` 을 덮어쓰고, `window.CMS_READY` 뒤에 type.js / main.js / branch.js / fab.js 가 초기화합니다.
- 기본값은 HTML 그 자체입니다. 지점 페이지는 `src/build_branches.py` 의 BRANCHES 로 생성하며, 전화번호를 바꾸면 `js/cms.js` 의 `TEL` 도 같이 고칩니다.
- 저장 키: `text`(문구·링크·대표 사진 맵), `price.<지점>`, `hours.<지점>`, `reviews`, `slides.hero|fast|ba`, `fac.<지점>.<존>`.
- 방문 기록 정리: `npx wrangler d1 execute teamjj-db --remote --command "DELETE FROM hits WHERE ts < strftime('%s','now','-1 year')"`
- 올린 사진은 `files` 테이블, 주소 `/uploads/<id>.jpg`.
- 로그: `npx wrangler tail`
