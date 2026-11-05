// GitHub 공개 저장소의 커밋 기록을 가져와 업데이트 기록·통계 카드에서 함께 쓴다.
// 로그인 없이 쓰는 GitHub API는 방문자 IP당 시간당 60회 제한이 있어서, 10분 동안 localStorage에 저장해 둔다.
// 요청이 실패하면 마지막으로 받아 둔 기록을 대신 보여준다.

const OWNER = 'dudnjs123456-blip';

export const TRACKED_REPOS = [
  { repo: 'introduce', label: '포트폴리오' },
  { repo: 'ONE', label: 'IRON FIST' },
  { repo: 'Albartoon', label: '알바툰' },
];

const CACHE_KEY = 'yyw-github-activity-v1';
const CACHE_MS = 10 * 60 * 1000;

// 내용 없이 의미 없는 커밋 메시지는 기록에서 뺀다.
const SKIP_PATTERNS = [
  /^(초기 )?커밋 메시지$/,
  /^변경 내용에 대한 간결한 설명$/,
  /추가로 수정한 내용 커밋/,
  /^추가 수정사항 적용$/,
  /^테스트$/,
  /^one day$/i,
  /^add gitignore$/i,
  /^merge /i,
  /lfs|node_modules|remove_large_files|\.git directory|history clean|yallist/i,
];

const TYPE_LABELS = {
  feat: '기능',
  fix: '수정',
  style: '디자인',
  docs: '문서',
  refactor: '개선',
  perf: '성능',
  chore: '정리',
  test: '테스트',
};

function readCache({ allowStale = false } = {}) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!allowStale && Date.now() - parsed.savedAt > CACHE_MS) return null;
    return parsed.commits;
  } catch {
    return null;
  }
}

function writeCache(commits) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), commits }));
  } catch {
    // 저장소를 못 쓰는 브라우저(시크릿 모드 등)에서는 캐시 없이 동작한다.
  }
}

function toEntry(item, repoInfo) {
  const firstLine = (item.commit.message || '').split('\n')[0].trim();
  if (!firstLine || SKIP_PATTERNS.some(pattern => pattern.test(firstLine))) return null;

  let type = 'update';
  let text = firstLine;
  const match = firstLine.match(/^(\w+)(\([^)]*\))?!?:\s*(.+)$/);
  if (match && TYPE_LABELS[match[1].toLowerCase()]) {
    type = match[1].toLowerCase();
    text = match[3];
  }
  if (/^initial commit/i.test(firstLine)) {
    type = 'start';
    text = '프로젝트 시작';
  }

  return {
    sha: item.sha,
    date: item.commit.author?.date || item.commit.committer?.date,
    text,
    type,
    typeLabel: type === 'start' ? '시작' : TYPE_LABELS[type] || '업데이트',
    repo: repoInfo.repo,
    repoLabel: repoInfo.label,
    url: item.html_url,
  };
}

let pending = null;

// 세 저장소의 커밋을 최신순으로 합쳐서 돌려준다. 여러 컴포넌트가 불러도 요청은 한 번만 간다.
export function loadGithubActivity() {
  const cached = readCache();
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;

  pending = Promise.all(
    TRACKED_REPOS.map(info =>
      fetch(`https://api.github.com/repos/${OWNER}/${info.repo}/commits?per_page=100`)
        .then(res => (res.ok ? res.json() : []))
        .then(items => items.map(item => toEntry(item, info)).filter(Boolean))
        .catch(() => [])
    )
  )
    .then(lists => {
      const commits = lists.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
      if (commits.length) {
        writeCache(commits);
        return commits;
      }
      return readCache({ allowStale: true }) || [];
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

// 방문자 기기 시간대 기준 YYYY-MM-DD
export function localDateKey(dateLike) {
  const d = new Date(dateLike);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
