// 방명록: 누구나 이름과 코멘트를 남기고, 모든 방문자가 같은 목록을 본다.
// 저장소는 Supabase 테이블(guestbook). 주소와 공개용(anon) 키는 환경변수로 넣는다.
//   REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
//   REACT_APP_SUPABASE_ANON_KEY=eyJ...
// 테이블과 권한 설정은 supabase/guestbook.sql 참고.
// 아직 연결 전이면 이 브라우저(localStorage)에만 저장해서 화면은 그대로 쓸 수 있게 한다.

const URL = (process.env.REACT_APP_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const GUESTBOOK_SHARED = Boolean(URL && KEY);

export const NAME_MAX = 20;
export const MESSAGE_MAX = 200;

const LOCAL_KEY = 'yyw-guestbook-local';
const LAST_POST_KEY = 'yyw-guestbook-last';
const COOLDOWN_MS = 30 * 1000;
const LIST_LIMIT = 50;

const headers = extra => ({
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  ...extra,
});

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
  } catch {
    return [];
  }
};

export async function loadComments() {
  if (!GUESTBOOK_SHARED) return readLocal();
  const res = await fetch(
    `${URL}/rest/v1/guestbook?select=id,name,message,created_at&order=created_at.desc&limit=${LIST_LIMIT}`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`guestbook ${res.status}`);
  return res.json();
}

// 너무 빨리 연달아 남기는 것만 막는다. 남은 초를 돌려준다(0이면 바로 가능).
export function cooldownLeft() {
  try {
    const last = Number(localStorage.getItem(LAST_POST_KEY)) || 0;
    return Math.max(0, Math.ceil((last + COOLDOWN_MS - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

export async function addComment(rawName, rawMessage) {
  const name = rawName.trim().slice(0, NAME_MAX);
  const message = rawMessage.trim().slice(0, MESSAGE_MAX);
  if (!name || !message) throw new Error('empty');

  let saved;
  if (GUESTBOOK_SHARED) {
    const res = await fetch(`${URL}/rest/v1/guestbook`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=representation' }),
      body: JSON.stringify({ name, message }),
    });
    if (!res.ok) throw new Error(`guestbook ${res.status}`);
    [saved] = await res.json();
  } else {
    saved = { id: `local-${Date.now()}`, name, message, created_at: new Date().toISOString() };
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify([saved, ...readLocal()].slice(0, LIST_LIMIT)));
    } catch {
      // 저장소를 못 쓰면 이번 화면에서만 보인다.
    }
  }

  try {
    localStorage.setItem(LAST_POST_KEY, String(Date.now()));
  } catch {
    // 무시
  }
  return saved;
}
