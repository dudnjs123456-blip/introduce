-- 포트폴리오 방명록 테이블
-- Supabase 대시보드 > SQL Editor 에 붙여 넣고 한 번 실행하면 된다.
-- 누구나 읽기·쓰기는 되지만, 수정·삭제는 막혀 있다(지우려면 대시보드에서 직접).

create table if not exists public.guestbook (
  id bigint generated always as identity primary key,
  name text not null check (char_length(btrim(name)) between 1 and 20),
  message text not null check (char_length(btrim(message)) between 1 and 200),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_created_at_idx on public.guestbook (created_at desc);

alter table public.guestbook enable row level security;

drop policy if exists "guestbook read" on public.guestbook;
create policy "guestbook read" on public.guestbook
  for select to anon, authenticated using (true);

drop policy if exists "guestbook write" on public.guestbook;
create policy "guestbook write" on public.guestbook
  for insert to anon, authenticated
  with check (
    char_length(btrim(name)) between 1 and 20
    and char_length(btrim(message)) between 1 and 200
  );

-- 공개 키로는 목록 조회와 새 글 추가만 가능하게, 나머지 권한은 거둔다.
revoke update, delete, truncate on public.guestbook from anon, authenticated;
