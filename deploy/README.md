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
- 비밀번호 로그인(4자 이상, PBKDF2 해시를 D1 에 저장, wrangler secret 불필요). 5회 실패 시 10분 잠금. 오른쪽 위 "비밀번호 변경".
- 탭
  - **방문 통계**: 오늘·7일·30일, 일별 막대, 페이지별, 유입 경로
  - **메인 문구**: 메인 제목·소개 문구, 카카오톡 채널 주소(오른쪽 아래 카톡 버튼), 대표 인스타·블로그
  - **지점 정보 · 가격**: 지점별 회원권 가격표, PT 가격표, 요일별 운영시간, 주소·전화·주차·대중교통, 강조 칩, 메인 카드 문구, 예약·지도·SNS 링크, 지점 카카오톡 채널, 대표 사진 2장
  - **회원 후기**: 메인 후기 카드(별점·내용·태그·이름·출처)
  - **메인 사진**: 첫 화면 슬라이드, 시설 사진 띠, 비포애프터
  - **지점 시설 사진**: 지점별 머신존·프리웨이트존·유산소존·탈의실 슬라이드
- 저장하면 고객 화면은 새로고침 때 반영(최대 30초 캐시). "원래대로" 는 HTML 기본값으로 복귀.
- 문구에서 `**단어**` 는 빨간 글자, 줄바꿈은 그대로 반영.
- 비밀번호를 잊으면: `npx wrangler d1 execute teamjj-db --remote --command "DELETE FROM settings WHERE key='auth'"` → /admin 에서 다시 설정(지우는 즉시 바로 설정할 것).

## 구조 메모
- `js/cms.js` 가 `<head>` 에서 `/api/content` 를 받아 `data-cms`(문구) · `data-cms-href`(링크) · `data-cms-bg`(배경 사진) · `data-cms-price` / `data-cms-pt`(가격표) · `data-cms-hours`(운영시간표) · `#revTrack` `#baTrack` `#heroSlides` `#fastA/B` · `.zone[data-zone]` 을 덮어쓰고, `window.CMS_READY` 뒤에 type.js / main.js / branch.js / fab.js 가 초기화합니다.
- 기본값은 HTML 그 자체입니다. 지점 페이지는 `src/build_branches.py` 의 BRANCHES 로 생성하며, 전화번호를 바꾸면 `js/cms.js` 의 `TEL` 도 같이 고칩니다.
- 저장 키: `text`(문구·링크·대표 사진 맵), `price.<지점>`, `hours.<지점>`, `reviews`, `slides.hero|fast|ba`, `fac.<지점>.<존>`.
- 방문 기록은 `visits` (페이지, 유입 도메인, 무작위 브라우저 ID, 화면 폭 — 개인정보 없음). 정리: `npx wrangler d1 execute teamjj-db --remote --command "DELETE FROM visits WHERE ts < strftime('%s','now','-1 year')"`
- 올린 사진은 `files` 테이블, 주소 `/uploads/<id>.jpg`.
- 로그: `npx wrangler tail`
