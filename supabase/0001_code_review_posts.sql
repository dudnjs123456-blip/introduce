-- 포트폴리오: 매일 자동 코드 리뷰 게시글
-- (게임 IRON FIST 와 같은 Supabase 프로젝트를 쓴다)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run.
--
-- 매일 밤 클라우드 예약 작업(Claude)이 저장소별 그날 커밋을 리뷰해서
-- publish_code_review() 함수로 글을 올린다. 사이트 방문자는 읽기만 한다.

-- ───────────────────────── 리뷰 게시글 ─────────────────────────
create table if not exists public.code_review_posts (
  id           bigint generated always as identity primary key,
  review_date  date not null,                 -- 리뷰한 날 (한국 시간)
  repo         text not null,                 -- 예: dudnjs123456-blip/ONE
  title        text not null check (char_length(title) between 1 and 120),
  summary      text not null default '',      -- 그날 작업 한눈에 보기
  -- [{severity, category, file, title, code, comment, suggestion}]
  findings     jsonb not null default '[]'::jsonb check (jsonb_typeof(findings) = 'array'),
  -- [{sha, message, url}]
  commits      jsonb not null default '[]'::jsonb check (jsonb_typeof(commits) = 'array'),
  hidden       boolean not null default false,  -- true 면 사이트에서 숨김
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (review_date, repo)
);

comment on table public.code_review_posts is '저장소별 하루 코드 리뷰 (Claude 자동 작성)';

create index if not exists code_review_posts_date_idx on public.code_review_posts (review_date desc);

alter table public.code_review_posts enable row level security;

drop policy if exists "code review posts: read visible" on public.code_review_posts;
create policy "code review posts: read visible" on public.code_review_posts
  for select to anon, authenticated using (hidden = false);

grant select on public.code_review_posts to anon, authenticated;

-- ───────────────────────── 글쓰기 키 ─────────────────────────
-- 키 원문은 예약 작업만 알고, DB 에는 sha256 해시만 저장한다.
-- 정책이 없으므로 사이트(anon)에서는 이 표를 읽을 수 없다.
create table if not exists public.code_review_keys (
  key_hash    text primary key,
  created_at  timestamptz not null default now()
);
alter table public.code_review_keys enable row level security;
revoke all on public.code_review_keys from anon, authenticated;

insert into public.code_review_keys (key_hash)
values ('e04359e1ea360555ea6d40f762261d90b0a3b56963b1334924f60f0570aaef29')
on conflict do nothing;

-- ───────────────────────── 글 올리기 함수 ─────────────────────────
-- 같은 날·같은 저장소 글이 있으면 덮어쓴다 (다시 돌려도 중복 안 생김).
create or replace function public.publish_code_review(p_key text, p_post jsonb)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if not exists (
    select 1 from public.code_review_keys
    where key_hash = encode(sha256(convert_to(p_key, 'UTF8')), 'hex')
  ) then
    raise exception 'invalid key' using errcode = '42501';
  end if;

  insert into public.code_review_posts (review_date, repo, title, summary, findings, commits)
  values (
    (p_post->>'review_date')::date,
    p_post->>'repo',
    p_post->>'title',
    coalesce(p_post->>'summary', ''),
    coalesce(p_post->'findings', '[]'::jsonb),
    coalesce(p_post->'commits', '[]'::jsonb)
  )
  on conflict (review_date, repo) do update set
    title      = excluded.title,
    summary    = excluded.summary,
    findings   = excluded.findings,
    commits    = excluded.commits,
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.publish_code_review(text, jsonb) from public;
grant execute on function public.publish_code_review(text, jsonb) to anon, authenticated;
