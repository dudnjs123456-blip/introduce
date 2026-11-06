// 코드 리뷰 글을 Supabase 에 올린다 (같은 날·같은 저장소 글이 있으면 덮어씀).
// 사용법: REVIEW_KEY=crk_... node scripts/code-review/publish.mjs post.json [post2.json ...]
// post.json 형식은 scripts/code-review/PROMPT.md 참고.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const env = Object.fromEntries(
  readFileSync(join(root, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()])
);
const url = env.REACT_APP_SUPABASE_URL;
const anon = env.REACT_APP_SUPABASE_ANON_KEY;
const key = process.env.REVIEW_KEY;
if (!url || !anon) throw new Error('.env 에 Supabase URL/키가 없습니다');
if (!key) throw new Error('REVIEW_KEY 환경변수가 필요합니다');

const files = process.argv.slice(2);
if (!files.length) throw new Error('올릴 JSON 파일을 지정하세요');

let failed = 0;
for (const file of files) {
  const post = JSON.parse(readFileSync(file, 'utf8'));
  for (const f of ['review_date', 'repo', 'title']) {
    if (!post[f]) throw new Error(`${file}: ${f} 가 비어 있습니다`);
  }
  const res = await fetch(`${url}/rest/v1/rpc/publish_code_review`, {
    method: 'POST',
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_key: key, p_post: post }),
  });
  const text = await res.text();
  if (res.ok) console.log(`OK ${post.repo} ${post.review_date} → id ${text}`);
  else { failed++; console.error(`FAIL ${file}: ${res.status} ${text}`); }
}
process.exit(failed ? 1 : 0);
