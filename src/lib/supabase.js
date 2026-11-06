import { createClient } from '@supabase/supabase-js';

// 게임 IRON FIST 와 같은 Supabase 프로젝트. .env 에 값이 없으면 null → 코멘트 기능만 꺼진다.
const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

// 방문자는 로그인하지 않으므로 세션을 저장하지 않는다 (게임 로그인 세션과 섞이지 않게)
export const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
