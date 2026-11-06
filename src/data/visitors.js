// 방문자 수 집계 (무료 카운터 서비스 Abacus)
//
// 세는 규칙
//  1. 내 컴퓨터(localhost)에서 열면 세지 않고 실제 숫자만 읽어 온다.
//  2. 주소에 ?owner=1 을 한 번 붙여 열면 그 브라우저는 앞으로 세지 않는다. (?owner=0 으로 해제)
//  3. 같은 브라우저는 하루에 한 번만 센다.
//  4. 같은 IP도 하루에 한 번만 센다. IP는 그대로 보내지 않고, 알아볼 수 없게 바꾼(해시) 값만 쓴다.
//  날짜는 방문자 시간대와 상관없이 한국 시간 기준이다.

const COUNTER_BASE = 'https://abacus.jasoncameron.dev';
const NAMESPACE = 'dudnjs-introduce';
const VISITED_KEY = 'yyw-visited-day';
const OWNER_KEY = 'yyw-owner';
const HASH_SALT = 'yyw-portfolio-visitor';

const IS_LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // 저장소를 못 쓰면 기억하지 않는다.
    }
  },
};

function koreaDateKey() {
  // en-CA 형식은 YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()).replace(/-/g, '');
}

function isOwner() {
  const flag = new URLSearchParams(window.location.search).get('owner');
  if (flag === '1') storage.set(OWNER_KEY, '1');
  if (flag === '0') storage.set(OWNER_KEY, null);
  return storage.get(OWNER_KEY) === '1';
}

// 값이 없으면 0, 요청 실패면 null
async function counter(action, key) {
  try {
    const res = await fetch(`${COUNTER_BASE}/${action}/${NAMESPACE}/${key}`);
    if (res.status === 404) return 0;
    if (!res.ok) return null;
    const data = await res.json();
    return data.value ?? 0;
  } catch {
    return null;
  }
}

async function hashedIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (!res.ok) return null;
    const { ip } = await res.json();
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${HASH_SALT}:${ip}`));
    return Array.from(new Uint8Array(bytes).slice(0, 8), b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

// 이번 방문을 세야 하는지 판단하고, 세야 하면 IP 표시를 남긴다.
async function shouldCount(today) {
  if (IS_LOCAL || isOwner()) return false;
  if (storage.get(VISITED_KEY) === today) return false;

  const ipHash = await hashedIp();
  if (ipHash) {
    const ipKey = `ip-${ipHash}-${today}`;
    const seen = await counter('get', ipKey);
    if (seen === null) return false; // 확인이 안 되면 부풀리지 않도록 세지 않는다
    if (seen > 0) return false;
    await counter('hit', ipKey);
  }
  return true;
}

let pending = null;

// { today, total } — 같은 페이지에서 여러 번 불려도 요청은 한 번만 간다.
export function loadVisitors() {
  if (pending) return pending;
  pending = (async () => {
    const today = koreaDateKey();
    const count = await shouldCount(today);
    const action = count ? 'hit' : 'get';
    const [todayCount, total] = await Promise.all([counter(action, `day-${today}`), counter(action, 'total')]);
    if (count && todayCount !== null) storage.set(VISITED_KEY, today);
    return { today: todayCount, total, counted: count };
  })();
  return pending;
}
