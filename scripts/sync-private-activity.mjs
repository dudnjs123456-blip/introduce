// 비공개 저장소(eywa-test)에서 "내 커밋"의 제목 한 줄과 날짜만 뽑아 JSON으로 저장한다.
// 코드·파일·상세 내용은 가져오지 않는다. GitHub Actions(.github/workflows/private-activity.yml)가 실행한다.
//
// 환경변수
//   GH_TOKEN  eywa-test 읽기 권한이 있는 토큰 (저장소 Secrets 의 EYWA_TOKEN)
//   OUT       저장할 파일 경로 (기본: private-activity.json)
import { writeFileSync } from 'node:fs';

const OWNER = 'dudnjs123456-blip';
const REPO = 'eywa-test';
// 이 이메일로 올린 커밋만 공개한다. 함께 작업하는 다른 분들 커밋은 빼기 위해서.
const MY_EMAILS = ['dudnjs123456@gmail.com', 'ghkfkddlqtl@naver.com'];
const KEEP = 100;

const token = process.env.GH_TOKEN;
if (!token) {
  console.error('GH_TOKEN 이 없습니다.');
  process.exit(1);
}
const out = process.env.OUT || 'private-activity.json';

const api = async path => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`${path} → ${res.status} ${await res.text()}`);
  return res.json();
};

const branches = await api(`/repos/${OWNER}/${REPO}/branches?per_page=100`);
const bySha = new Map();

for (const branch of branches) {
  for (const email of MY_EMAILS) {
    const list = await api(
      `/repos/${OWNER}/${REPO}/commits?sha=${encodeURIComponent(branch.name)}&author=${encodeURIComponent(email)}&per_page=100`
    );
    for (const item of list) {
      const authorEmail = (item.commit.author?.email || '').toLowerCase();
      if (!MY_EMAILS.includes(authorEmail)) continue;
      if (item.parents?.length > 1) continue; // 병합 커밋은 뺀다
      bySha.set(item.sha, {
        sha: item.sha,
        date: item.commit.author?.date || item.commit.committer?.date,
        message: (item.commit.message || '').split('\n')[0].trim(),
      });
    }
  }
}

const commits = [...bySha.values()].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, KEEP);
writeFileSync(out, `${JSON.stringify({ repo: REPO, commits }, null, 2)}\n`);
console.log(`${branches.length}개 브랜치에서 내 커밋 ${commits.length}개 저장 → ${out}`);
