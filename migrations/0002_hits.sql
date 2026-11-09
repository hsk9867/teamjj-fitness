-- 방문 통계 대시보드용 기록 (라이칸짐 관리자와 같은 구성). 개인정보 없음.
-- type : view(페이지 열람) · event(버튼 클릭) · leave(페이지를 떠날 때 머문 시간·스크롤 깊이)
-- vid  : 브라우저에 저장되는 무작위 16자리 ID (없으면 날짜+IP+브라우저의 해시)
-- pvid : 페이지 열람 1회마다 새로 만드는 ID — leave 는 열람 1회당 한 줄만 남긴다
-- 예전 visits 테이블은 더 쓰지 않는다(남겨 둠).
CREATE TABLE IF NOT EXISTS hits (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  ts       INTEGER NOT NULL,
  day      TEXT NOT NULL,        -- 한국시간 YYYY-MM-DD
  hour     INTEGER NOT NULL,     -- 한국시간 0~23
  type     TEXT NOT NULL,
  name     TEXT,                 -- event 이름 (tel · kakao · booking · insta · blog · map · price)
  path     TEXT NOT NULL,
  ref_host TEXT,
  ref_url  TEXT,
  source   TEXT,                 -- 유입경로 (네이버 검색 · 인스타그램 · 직접 유입 …)
  medium   TEXT,
  campaign TEXT,
  device   TEXT,
  browser  TEXT,
  os       TEXT,
  country  TEXT,
  city     TEXT,
  vid      TEXT,
  screen   TEXT,
  lang     TEXT,
  pvid     TEXT,
  dur      INTEGER,              -- leave: 화면에 보인 시간(초)
  depth    INTEGER               -- leave: 스크롤 깊이(%)
);
CREATE INDEX IF NOT EXISTS hits_day ON hits (day, type);
CREATE INDEX IF NOT EXISTS hits_ts ON hits (ts);
CREATE UNIQUE INDEX IF NOT EXISTS hits_leave_pv ON hits (pvid) WHERE type = 'leave';
