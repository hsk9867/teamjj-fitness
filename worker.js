// 팀JJ피트니스 Worker — 정적 파일은 Cloudflare assets 가 먼저 처리하고, 여기는 /api/* 와 /uploads/* 만 맡는다.
// 저장소: D1 (binding DB). settings(비밀번호 해시·세션 키), content(관리자 저장값), visits(방문 기록), files(사진).
// 비밀번호는 관리자 페이지에서 처음 한 번 정하며(wrangler secret 불필요), 세션은 HMAC 서명 쿠키.

const COOKIE = 'jj_admin';
const SESSION_DAYS = 30;
const KST = 9 * 3600;
const MAX_UPLOAD = 1536 * 1024;        // 1.5MB (관리자 화면이 1600px 로 줄여 올림)

const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
const enc = new TextEncoder();
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const rand = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));

// ---------- settings ----------
async function getSetting(env, key) {
  const r = await env.DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
  return r ? r.value : null;
}
const setSetting = (env, key, value) => env.DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').bind(key, value).run();

async function sessionKey(env) {
  let k = await getSetting(env, 'session_key');
  if (!k) { k = rand(32); await setSetting(env, 'session_key', k); }
  return crypto.subtle.importKey('raw', enc.encode(k), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

// ---------- 비밀번호 (PBKDF2-SHA256) ----------
async function hashPassword(pw, salt) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, key, 256);
  return hex(bits);
}
async function verifyPassword(env, pw) {
  const raw = await getSetting(env, 'auth');
  if (!raw) return false;
  const { salt, hash } = JSON.parse(raw);
  return (await hashPassword(pw, salt)) === hash;
}
async function setPassword(env, pw) {
  const salt = rand(16);
  await setSetting(env, 'auth', JSON.stringify({ salt, hash: await hashPassword(pw, salt) }));
}

// ---------- 세션 쿠키 ----------
async function makeCookie(env) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const payload = exp + '.' + rand(8);
  const sig = b64url(await crypto.subtle.sign('HMAC', await sessionKey(env), enc.encode(payload)));
  return `${COOKIE}=${payload}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
}
const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
async function isAdmin(env, req) {
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  if (!m) return false;
  const parts = m[1].split('.');
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (parseInt(exp, 10) < Date.now() / 1000) return false;
  const expect = b64url(await crypto.subtle.sign('HMAC', await sessionKey(env), enc.encode(exp + '.' + nonce)));
  return expect === sig;
}

// 로그인 실패 5회 → 10분 잠금
async function loginLocked(env) {
  const raw = await getSetting(env, 'login_fail');
  if (!raw) return false;
  const { n, at } = JSON.parse(raw);
  return n >= 5 && Date.now() / 1000 - at < 600;
}
async function noteFail(env, ok) {
  if (ok) { await setSetting(env, 'login_fail', JSON.stringify({ n: 0, at: 0 })); return; }
  const raw = await getSetting(env, 'login_fail');
  const cur = raw ? JSON.parse(raw) : { n: 0, at: 0 };
  const fresh = Date.now() / 1000 - cur.at > 600;
  await setSetting(env, 'login_fail', JSON.stringify({ n: fresh ? 1 : cur.n + 1, at: Math.floor(Date.now() / 1000) }));
}

// ---------- 방문 기록 (hits) ----------
// js/track.js 가 보내는 것: view(페이지 열람) · event(버튼 클릭) · leave(머문 시간·스크롤 깊이). 개인정보는 저장하지 않는다.
const BOT_RE = /bot|crawl|spider|slurp|yeti|daumoa|kakaotalk-scrap|facebookexternalhit|headless|lighthouse|pagespeed|preview|monitor|python|curl\/|wget|httpclient|go-http|java\/|okhttp|scrapy|phantom|puppeteer|playwright|gptbot|claudebot|perplexitybot|bytespider|petalbot|semrush|ahrefs|mj12|dataforseo|screaming/i;
const EVENTS = new Set(['tel', 'kakao', 'booking', 'insta', 'blog', 'map', 'price']);
const CONTACT_SQL = "('tel','kakao','booking')";      // 연락 액션: 전화 · 카카오톡 · 네이버 예약
const SID_RE = /^[a-f0-9]{16}$/, PV_RE = /^[a-f0-9]{12}$/;
const noContent = () => new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
const kstOf = (ts) => { const d = new Date((ts + KST) * 1000); return { day: d.toISOString().slice(0, 10), hour: d.getUTCHours() }; };

function parseUA(ua) {
  const device = /iPad|Tablet|SM-T\d/i.test(ua) ? '태블릿' : /Mobi|Android|iPhone/i.test(ua) ? '모바일' : 'PC';
  const os = /Windows/i.test(ua) ? 'Windows' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Android/i.test(ua) ? 'Android' : /Mac OS/i.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/i.test(ua) ? 'Linux' : '기타';
  const browser = /KAKAOTALK/i.test(ua) ? '카카오톡 인앱' : /Instagram/i.test(ua) ? '인스타그램 인앱' : /NAVER\(inapp/i.test(ua) ? '네이버 앱' : /FBAN|FBAV/.test(ua) ? '페이스북 인앱' : /Whale\//.test(ua) ? '웨일' : /SamsungBrowser/.test(ua) ? '삼성 인터넷' : /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\/|CriOS/.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '기타';
  return { device, os, browser };
}
const SOURCE_RULES = [
  [/(^|\.)search\.naver\.com$/, '네이버 검색'], [/(^|\.)map\.naver\.com$/, '네이버 지도'], [/(^|\.)place\.naver\.com$/, '네이버 플레이스'],
  [/(^|\.)booking\.naver\.com$/, '네이버 예약'], [/(^|\.)blog\.naver\.com$/, '네이버 블로그'], [/(^|\.)cafe\.naver\.com$/, '네이버 카페'],
  [/(^|\.)(naver\.com|naver\.me)$/, '네이버'], [/gemini\.google\.com$/, 'Gemini'], [/(^|\.)google\./, '구글'], [/(^|\.)daum\.net$/, '다음'],
  [/(^|\.)bing\.com$/, 'Bing'], [/(^|\.)kakao\.com$/, '카카오톡'], [/(^|\.)daangn\.com$/, '당근'], [/instagram\.com$/, '인스타그램'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, '페이스북'], [/(^|\.)(youtube\.com|youtu\.be)$/, '유튜브'], [/(chatgpt\.com|openai\.com)$/, 'ChatGPT'],
  [/perplexity\.ai$/, 'Perplexity'], [/threads\.(net|com)$/, 'Threads'], [/(^|\.)(zum\.com|nate\.com|yahoo\.|duckduckgo\.com)/, '기타 검색'],
];
const UTM_NAMES = { naver: '네이버', google: '구글', kakao: '카카오톡', kakaotalk: '카카오톡', instagram: '인스타그램', insta: '인스타그램', facebook: '페이스북', youtube: '유튜브', blog: '블로그', sms: '문자', email: '이메일', qr: 'QR코드', namecard: '명함', flyer: '전단지', banner: '현수막', daangn: '당근' };
function classifySource(refHost, utmSource, ua) {
  if (utmSource) return UTM_NAMES[utmSource.toLowerCase()] || utmSource.slice(0, 40);
  const h = (refHost || '').toLowerCase();
  if (!h) {
    if (/KAKAOTALK/i.test(ua)) return '카카오톡';
    if (/Instagram/i.test(ua)) return '인스타그램';
    if (/NAVER\(inapp/i.test(ua)) return '네이버 앱';
    return '직접 유입';
  }
  for (const [re, name] of SOURCE_RULES) if (re.test(h)) return name;
  return '기타 사이트';
}

async function track(req, env, ctx, url) {
  const origin = req.headers.get('origin');
  if (origin) { try { if (new URL(origin).host !== url.host) return new Response(null, { status: 403 }); } catch (e) { return new Response(null, { status: 403 }); } }
  const ua = req.headers.get('user-agent') || '';
  if (!ua || BOT_RE.test(ua)) return noContent();
  if ((req.headers.get('cookie') || '').includes(COOKIE + '=') && (await isAdmin(env, req))) return noContent();   // 관리자 본인은 세지 않는다
  let b;
  try { const text = await req.text(); if (text.length > 4096) return noContent(); b = JSON.parse(text); } catch (e) { return noContent(); }
  if (!b || typeof b !== 'object') return noContent();

  let path = typeof b.p === 'string' ? b.p.split('?')[0].split('#')[0] : '';
  if (!path.startsWith('/') || path.length > 200 || path.startsWith('/admin') || path.startsWith('/api')) return noContent();
  path = path.replace(/\.html$/, '').replace(/\/index$/, '/');
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  const type = b.t === 'event' ? 'event' : b.t === 'leave' ? 'leave' : 'view';
  const name = type === 'event' ? String(b.e || '') : null;
  if (type === 'event' && !EVENTS.has(name)) return noContent();
  const pvid = PV_RE.test(b.v || '') ? b.v : null;
  let dur = null, depth = null;
  if (type === 'leave') {
    dur = Math.max(0, Math.min(3600, Math.round(Number(b.d) || 0)));
    depth = Math.max(0, Math.min(100, Math.round(Number(b.sd) || 0)));
    if (!pvid || dur < 1) return noContent();
  }

  let refHost = null, refUrl = null;
  if (typeof b.r === 'string' && b.r) {
    try {
      const r = new URL(b.r), h = r.hostname.toLowerCase();
      if (h !== url.hostname.toLowerCase() && !/(^|\.)teamjjfitness\.co\.kr$|^teamjj-fitness\.hsk9867\.workers\.dev$/.test(h)) {
        refHost = h.replace(/^www\./, ''); refUrl = (r.origin + r.pathname + r.search).slice(0, 500);
      }
    } catch (e) {}
  }
  let utmSource = null, medium = null, campaign = null;
  if (typeof b.q === 'string' && b.q) {
    const q = new URLSearchParams(b.q);
    utmSource = (q.get('utm_source') || '').slice(0, 60) || null;
    medium = (q.get('utm_medium') || '').slice(0, 60) || null;
    campaign = (q.get('utm_campaign') || '').slice(0, 80) || null;
  }
  const { device, os, browser } = parseUA(ua);
  const cf = req.cf || {};
  const ts = Math.floor(Date.now() / 1000);
  const { day, hour } = kstOf(ts);
  let vid = SID_RE.test(b.sid || '') ? b.sid : null;
  if (!vid) vid = hex(await crypto.subtle.digest('SHA-256', enc.encode(day + '|' + (req.headers.get('cf-connecting-ip') || '0') + '|' + ua))).slice(0, 16);

  const stmt = env.DB.prepare(
    'INSERT INTO hits (ts, day, hour, type, name, path, ref_host, ref_url, source, medium, campaign, device, browser, os, country, city, vid, screen, lang, pvid, dur, depth) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)' +
    (type === 'leave' ? " ON CONFLICT (pvid) WHERE type = 'leave' DO UPDATE SET ts = excluded.ts, dur = MAX(dur, excluded.dur), depth = MAX(depth, excluded.depth)" : '')
  ).bind(ts, day, hour, type, name, path, refHost, refUrl, classifySource(refHost, utmSource, ua), medium, campaign, device, browser, os,
    cf.country || null, cf.city ? String(cf.city).slice(0, 60) : null, vid,
    typeof b.s === 'string' ? b.s.slice(0, 20) : null, typeof b.l === 'string' ? b.l.slice(0, 10) : null, pvid, dur, depth);
  ctx.waitUntil(stmt.run().catch(() => {}));
  return noContent();
}

// ---------- 통계 (관리자 대시보드) ----------
const validDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T00:00:00Z'));
const shiftDay = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
function dayRange(url, defDays) {
  const today = kstOf(Math.floor(Date.now() / 1000)).day;
  let from = url.searchParams.get('from'), to = url.searchParams.get('to');
  if (!validDay(to)) to = today;
  if (!validDay(from)) from = shiftDay(to, -(defDays - 1));
  if (from > to) [from, to] = [to, from];
  let days = Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
  if (days > 400) { from = shiftDay(to, -399); days = 400; }
  return { from, to, days, today };
}

async function stats(env, url) {
  const { from, to, days, today } = dayRange(url, 7);
  const pFrom = shiftDay(from, -days), pTo = shiftDay(from, -1);
  const now = Math.floor(Date.now() / 1000);
  const q = (sql, ...args) => env.DB.prepare(sql).bind(...args);
  const VIEWS = `SELECT COUNT(*) pv, COUNT(DISTINCT vid) uv, COUNT(DISTINCT day || vid) visits FROM hits WHERE type='view' AND day BETWEEN ? AND ?`;
  const EVS = `SELECT COUNT(*) c, COUNT(DISTINCT vid) u FROM hits WHERE type='event' AND day BETWEEN ? AND ?`;
  const LEAVES = `SELECT COUNT(*) leaves, IFNULL(ROUND(AVG(dur)), 0) dur, IFNULL(ROUND(AVG(depth)), 0) depth FROM hits WHERE type='leave' AND day BETWEEN ? AND ?`;
  const BOUNCE = `SELECT COUNT(*) n FROM (SELECT 1 FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY day, vid HAVING COUNT(*) = 1)`;
  const EVNAME = `SELECT name, COUNT(*) c, COUNT(DISTINCT vid) u FROM hits WHERE type='event' AND day BETWEEN ? AND ? GROUP BY name ORDER BY c DESC`;
  const rows = await env.DB.batch([
    /* 0 */ q(VIEWS, from, to), /* 1 */ q(VIEWS, pFrom, pTo),
    /* 2 */ q(EVS, from, to), /* 3 */ q(EVS, pFrom, pTo),
    /* 4 */ q(LEAVES, from, to), /* 5 */ q(LEAVES, pFrom, pTo),
    /* 6 */ q(BOUNCE, from, to), /* 7 */ q(BOUNCE, pFrom, pTo),
    /* 8 */ q(EVNAME, from, to), /* 9 */ q(EVNAME, pFrom, pTo),
    /* 10 */ q(`SELECT COUNT(*) n FROM (SELECT vid, MIN(day) d0 FROM hits WHERE type='view' GROUP BY vid) WHERE d0 BETWEEN ? AND ?`, from, to),
    /* 11 */ q(`SELECT day, SUM(type='view') pv, COUNT(DISTINCT CASE WHEN type='view' THEN vid END) uv, SUM(type='event' AND name IN ${CONTACT_SQL}) ev FROM hits WHERE day BETWEEN ? AND ? GROUP BY day ORDER BY day`, from, to),
    /* 12 */ q(`SELECT hour, SUM(type='view') pv, COUNT(DISTINCT CASE WHEN type='view' THEN vid END) uv, SUM(type='event' AND name IN ${CONTACT_SQL}) ev FROM hits WHERE day BETWEEN ? AND ? GROUP BY hour ORDER BY hour`, from, to),
    /* 13 */ q(`SELECT source, COUNT(*) pv, COUNT(DISTINCT vid) uv FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY source ORDER BY uv DESC, pv DESC LIMIT 20`, from, to),
    /* 14 */ q(`SELECT CAST(strftime('%w', day) AS INTEGER) wd, hour, COUNT(*) pv, COUNT(DISTINCT day || vid) uv FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY wd, hour`, from, to),
    /* 15 */ q(`SELECT v.source source, COUNT(*) visits, COUNT(c.vid) cv FROM (SELECT day, vid, source, MIN(ts) t0 FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY day, vid) v LEFT JOIN (SELECT DISTINCT day, vid FROM hits WHERE type='event' AND name IN ${CONTACT_SQL} AND day BETWEEN ? AND ?) c ON c.day = v.day AND c.vid = v.vid GROUP BY v.source ORDER BY visits DESC LIMIT 20`, from, to, from, to),
    /* 16 */ q(`SELECT path, ROUND(AVG(dur)) dur, ROUND(AVG(depth)) depth FROM hits WHERE type='leave' AND day BETWEEN ? AND ? GROUP BY path`, from, to),
    /* 17 */ q(`SELECT path, COUNT(*) pv, COUNT(DISTINCT vid) uv FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY path ORDER BY pv DESC LIMIT 20`, from, to),
    /* 18 */ q(`SELECT p.path path, p.visits visits, IFNULL(e.ev, 0) ev, IFNULL(e.cv, 0) cv FROM (SELECT path, COUNT(DISTINCT day || vid) visits FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY path) p LEFT JOIN (SELECT path, COUNT(*) ev, COUNT(DISTINCT day || vid) cv FROM hits WHERE type='event' AND name IN ${CONTACT_SQL} AND day BETWEEN ? AND ? GROUP BY path) e ON e.path = p.path`, from, to, from, to),
    /* 19 */ q(`SELECT path, COUNT(*) c FROM (SELECT path, MIN(ts) t0 FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY day, vid) GROUP BY path ORDER BY c DESC LIMIT 15`, from, to),
    /* 20 */ q(`SELECT ref_host, ref_url, COUNT(*) pv, COUNT(DISTINCT vid) uv FROM hits WHERE type='view' AND ref_host IS NOT NULL AND day BETWEEN ? AND ? GROUP BY ref_url ORDER BY uv DESC, pv DESC LIMIT 30`, from, to),
    /* 21 */ q(`SELECT source, medium, campaign, COUNT(*) pv, COUNT(DISTINCT vid) uv FROM hits WHERE type='view' AND (medium IS NOT NULL OR campaign IS NOT NULL) AND day BETWEEN ? AND ? GROUP BY source, medium, campaign ORDER BY uv DESC LIMIT 30`, from, to),
    /* 22 */ q(`SELECT 'device' dim, device k, COUNT(DISTINCT vid) uv FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY device
       UNION ALL SELECT 'browser', browser, COUNT(DISTINCT vid) FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY browser
       UNION ALL SELECT 'os', os, COUNT(DISTINCT vid) FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY os
       UNION ALL SELECT 'country', country, COUNT(DISTINCT vid) FROM hits WHERE type='view' AND day BETWEEN ? AND ? GROUP BY country
       UNION ALL SELECT 'city', city, COUNT(DISTINCT vid) FROM hits WHERE type='view' AND city IS NOT NULL AND day BETWEEN ? AND ? GROUP BY city
       ORDER BY dim, uv DESC`, from, to, from, to, from, to, from, to, from, to),
    /* 23 */ q(`SELECT COUNT(DISTINCT vid) n FROM hits WHERE ts > ?`, now - 300),
    /* 24 */ q(`SELECT ts, type, name, path, dur, source, ref_host, device, browser, country, city FROM hits WHERE NOT (type='leave' AND IFNULL(dur, 0) < 10) ORDER BY ts DESC LIMIT 50`),
    /* 25 */ q(`SELECT COUNT(*) pv, MIN(day) since FROM hits WHERE type='view'`),
    // D1 은 UNION 을 5개까지만 허용해서 화면 크기·언어는 따로 묻는다
    /* 26 */ q(`SELECT 'screen' dim, screen k, COUNT(DISTINCT vid) uv FROM hits WHERE type='view' AND screen IS NOT NULL AND day BETWEEN ? AND ? GROUP BY screen
       UNION ALL SELECT 'lang', lang, COUNT(DISTINCT vid) FROM hits WHERE type='view' AND lang IS NOT NULL AND day BETWEEN ? AND ? GROUP BY lang
       ORDER BY dim, uv DESC`, from, to, from, to),
  ]);
  const r = rows.map((x) => x.results || []);
  const dims = {};
  for (const row of r[22].concat(r[26])) (dims[row.dim] = dims[row.dim] || []).push({ k: row.k || '알 수 없음', uv: row.uv });
  const pack = (v, e, l, b) => ({ pv: v.pv, uv: v.uv, visits: v.visits, events: e.c, eventUsers: e.u, leaves: l.leaves, dur: l.dur, depth: l.depth, bounce: b.n });
  return {
    range: { from, to, days, prevFrom: pFrom, prevTo: pTo, today },
    totals: { ...pack(r[0][0], r[2][0], r[4][0], r[6][0]), newUsers: r[10][0].n },
    prev: { ...pack(r[1][0], r[3][0], r[5][0], r[7][0]), eventsByName: r[9] },
    events: r[8], daily: r[11], hourly: r[12], sources: r[13], heat: r[14], convBySource: r[15], engagement: r[16], pages: r[17],
    convByPage: r[18], landing: r[19], referrers: r[20], campaigns: r[21], dims, live: r[23][0].n, recent: r[24],
    all: { pv: r[25][0].pv, since: r[25][0].since },
  };
}

async function exportCsv(env, url) {
  const { from, to } = dayRange(url, 30);
  const cols = ['ts', 'day', 'hour', 'type', 'name', 'path', 'dur', 'depth', 'ref_host', 'ref_url', 'source', 'medium', 'campaign', 'device', 'browser', 'os', 'country', 'city', 'vid', 'screen', 'lang'];
  const { results } = await env.DB.prepare(`SELECT ${cols.join(', ')} FROM hits WHERE day BETWEEN ? AND ? ORDER BY ts LIMIT 50000`).bind(from, to).all();
  const cell = (v) => { if (v == null) return ''; const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const out = [cols.join(',')];
  for (const row of results) out.push(cols.map((c) => cell(row[c])).join(','));
  // 맨 앞 ﻿ 는 엑셀이 한글을 바로 읽게 하는 표시(BOM)
  return new Response('﻿' + out.join('\r\n'), {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="teamjj-visits-${from}_${to}.csv"`, 'cache-control': 'no-store' },
  });
}

// ---------- 라우팅 ----------
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;

    // 올린 사진
    if (p.startsWith('/uploads/')) {
      const id = p.slice(9).replace(/\.[a-z]+$/, '');
      if (!/^[a-f0-9]{24}$/.test(id)) return new Response('Not found', { status: 404 });
      const row = await env.DB.prepare('SELECT mime, data FROM files WHERE id = ?').bind(id).first();
      if (!row) return new Response('Not found', { status: 404 });
      return new Response(row.data, { headers: { 'content-type': row.mime, 'cache-control': 'public, max-age=31536000, immutable' } });
    }
    if (!p.startsWith('/api/')) return env.ASSETS.fetch(req);

    try {
      // 공개: 저장된 콘텐츠
      if (p === '/api/content' && req.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT key, value FROM content').all();
        const map = {}; results.forEach((r) => { try { map[r.key] = JSON.parse(r.value); } catch (e) {} });
        return json(map, 200, { 'cache-control': 'public, max-age=30' });
      }
      // 공개: 방문 기록
      if (p === '/api/track' && req.method === 'POST') return track(req, env, ctx, url);
      // 로그인 상태
      if (p === '/api/me') {
        const hasAuth = !!(await getSetting(env, 'auth'));
        return json({ admin: hasAuth && (await isAdmin(env, req)), setup: !hasAuth });
      }
      // 처음 비밀번호 설정 (비밀번호가 아직 없을 때만)
      if (p === '/api/setup' && req.method === 'POST') {
        if (await getSetting(env, 'auth')) return json({ error: '이미 비밀번호가 있습니다.' }, 409);
        const { password } = await req.json().catch(() => ({}));
        if (!password || password.length < 4) return json({ error: '비밀번호는 4자 이상이어야 합니다.' }, 400);
        await setPassword(env, password);
        return json({ ok: true }, 200, { 'set-cookie': await makeCookie(env) });
      }
      if (p === '/api/login' && req.method === 'POST') {
        if (await loginLocked(env)) return json({ error: '실패가 많아 10분간 잠겼습니다.' }, 429);
        const { password } = await req.json().catch(() => ({}));
        const ok = await verifyPassword(env, String(password || ''));
        await noteFail(env, ok);
        if (!ok) return json({ error: '비밀번호가 맞지 않습니다.' }, 401);
        return json({ ok: true }, 200, { 'set-cookie': await makeCookie(env) });
      }
      if (p === '/api/logout' && req.method === 'POST') return json({ ok: true }, 200, { 'set-cookie': clearCookie() });

      // 이하 관리자 전용
      if (!(await isAdmin(env, req))) return json({ error: '로그인이 필요합니다.' }, 401);

      if (p === '/api/password' && req.method === 'POST') {
        const { current, next } = await req.json().catch(() => ({}));
        if (!(await verifyPassword(env, String(current || '')))) return json({ error: '현재 비밀번호가 맞지 않습니다.' }, 401);
        if (!next || next.length < 4) return json({ error: '새 비밀번호는 4자 이상이어야 합니다.' }, 400);
        await setPassword(env, next);
        return json({ ok: true });
      }
      const mc = p.match(/^\/api\/content\/([a-z0-9_.-]{1,60})$/i);
      if (mc && req.method === 'PUT') {
        const text = await req.text();
        if (text.length > 400000) return json({ error: '내용이 너무 큽니다.' }, 413);
        let v; try { v = JSON.parse(text); } catch (e) { return json({ error: 'JSON 형식이 아닙니다.' }, 400); }
        await env.DB.prepare('INSERT INTO content (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').bind(mc[1], JSON.stringify(v), Math.floor(Date.now() / 1000)).run();
        return json({ ok: true });
      }
      if (mc && req.method === 'DELETE') {
        await env.DB.prepare('DELETE FROM content WHERE key = ?').bind(mc[1]).run();
        return json({ ok: true });
      }
      if (p === '/api/stats' && req.method === 'GET') return json(await stats(env, url));
      if (p === '/api/export' && req.method === 'GET') return exportCsv(env, url);
      if (p === '/api/status' && req.method === 'GET') {
        const [f, c] = await env.DB.batch([
          env.DB.prepare('SELECT COUNT(*) n, IFNULL(SUM(size), 0) bytes FROM files'),
          env.DB.prepare('SELECT key, updated_at FROM content ORDER BY updated_at DESC'),
        ]);
        return json({ files: f.results[0], content: c.results });
      }
      if (p === '/api/upload' && req.method === 'POST') {
        const mime = (req.headers.get('content-type') || '').split(';')[0].trim();
        if (!/^image\/(jpeg|png|webp)$/.test(mime)) return json({ error: 'JPEG·PNG·WebP 만 올릴 수 있습니다.' }, 415);
        const buf = await req.arrayBuffer();
        if (buf.byteLength > MAX_UPLOAD) return json({ error: '파일이 너무 큽니다 (최대 1.5MB).' }, 413);
        const id = rand(12), ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
        await env.DB.prepare('INSERT INTO files (id, mime, size, data, created) VALUES (?, ?, ?, ?, ?)').bind(id, mime, buf.byteLength, buf, Math.floor(Date.now() / 1000)).run();
        return json({ ok: true, url: '/uploads/' + id + '.' + ext });
      }
      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: '서버 오류: ' + (e && e.message ? e.message : e) }, 500);
    }
  },
};
