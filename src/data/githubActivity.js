// GitHub 공개 저장소의 커밋 기록을 가져와 업데이트 기록·통계 카드에서 함께 쓴다.
// 로그인 없이 쓰는 GitHub API는 방문자 IP당 시간당 60회 제한이 있어서, 10분 동안 localStorage에 저장해 둔다.
// 요청이 실패하면 마지막으로 받아 둔 기록을 대신 보여준다.
import { GITHUB_ACTIVITY_OVERRIDES } from './githubActivityOverrides';

const OWNER = 'dudnjs123456-blip';

export const TRACKED_REPOS = [
  { repo: 'introduce', label: '포트폴리오' },
  { repo: 'ONE', label: 'IRON FIST' },
  { repo: 'Albartoon', label: '알바툰' },
];

// 비공개 저장소는 GitHub Actions가 제목·날짜만 뽑아 activity-data 브랜치에 올려 둔 파일을 읽는다.
// (scripts/sync-private-activity.mjs, .github/workflows/private-activity.yml)
const PRIVATE_SOURCES = [
  {
    repo: 'eywa-test',
    label: '에이와',
    url: `https://raw.githubusercontent.com/${OWNER}/introduce/activity-data/private-activity.json`,
  },
];

const CACHE_KEY = 'yyw-github-activity-v10';
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
  /^모바일 화면 크기 조정$/,
  /^모바일 버튼·네브바·본문 글자 크기 조정$/,
  /^후기 이모지와 연락처 제목 제거$/,
  /기술 스택 강조 문구의 별 장식 제거 및 업데이트 기록 한글 표기 보완/,
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

const MESSAGE_TRANSLATIONS = {
  'polish portfolio and add eywa screenshots': '포트폴리오를 다듬고 EYWA 화면 이미지 추가',
  'add new feature related to project review section': '프로젝트 후기 섹션 기능 추가',
  'isolate character skills from park work': '캐릭터 기술과 공원 기능 분리',
  'all current project files including a-tag fixes and gitignore': '링크 수정과 Git 제외 설정을 포함한 프로젝트 파일 반영',
  'git history clean and .gitignore update': 'Git 기록 정리 및 제외 설정 갱신',
  'git history clean and .gitignore update for node_modules': 'Git 기록 정리 및 불필요한 의존성 폴더 제외 설정 갱신',
  'remove node_modules and update .gitignore': '불필요한 의존성 폴더 제거 및 Git 제외 설정 갱신',
  'add schdulesearch.js': '일정 검색 기능 추가',
  'track large files with git lfs': '대용량 파일을 Git LFS로 관리',
  'add remove_large_files.sh script': '대용량 파일 정리 스크립트 추가',
  'add albal_toon.git directory': '알바툰 저장소 파일 추가',
  'add small silver girl city skills': '은발 소녀의 도시 생활 기술 추가',
  'add small silver-haired girl character': '작은 은발 소녀 캐릭터 추가',
  'app.js useeffect ref cleanup eslint error (final apply)': '화면 요소 감지 기능의 정리 오류 수정',
  'app.js a 태그 관련 최종 수정': '링크 태그 최종 수정',
  'introduce 프로젝트 오늘 수정한 내용 반영': '포트폴리오 당일 수정 사항 반영',
  'eslint error in app.js and add missing babel plugin': '코드 검사 오류 수정 및 Babel 플러그인 추가',
  'update xmlhttprequest-ssl and yallist modules': '통신 및 목록 처리 라이브러리 업데이트',
  'improve tornado kick leap animation': '토네이도 킥 도약 동작 개선',
  'apply leap height to vrm characters': 'VRM 캐릭터에 도약 높이 적용',
  'add small silver back-turn kick': '은발 소녀 전용 뒤돌려차기 추가',
  'add airborne spin to back-turn kick': '뒤돌려차기에 공중 회전 동작 추가',
  'improve back-turn kick side strike': '뒤돌려차기 옆 타격 동작 개선',
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
  const override = GITHUB_ACTIVITY_OVERRIDES[`${repoInfo.repo}:${item.sha}`];
  if (override?.hidden) return null;

  const firstLine = (item.commit.message || '')
    .split('\n')[0]
    .trim()
    .replace(/^local[- ](test|setup):\s*/i, '') // 작업 메모용 머리말은 뺀다
    .replace(/\s*\(\d{4}-\d{2}-\d{2}[^)]*\)$/, ''); // 끝에 붙인 날짜는 기록 날짜와 겹치니 뺀다
  if (/(코디\s*(?:템|소품)|비키니|수영복|outfit\s*items?|cosmetic\s*items?)/i.test(firstLine)) return null;
  if (!firstLine || (!override && SKIP_PATTERNS.some(pattern => pattern.test(firstLine)))) return null;

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
  text = MESSAGE_TRANSLATIONS[text.trim().toLowerCase()] || text;
  if (override?.text?.trim()) text = override.text.trim();
  if (override?.type && TYPE_LABELS[override.type]) type = override.type;

  return {
    sha: item.sha,
    date: item.commit.author?.date || item.commit.committer?.date,
    text,
    type,
    typeLabel: type === 'start' ? '시작' : TYPE_LABELS[type] || '업데이트',
    repo: repoInfo.repo,
    repoLabel: repoInfo.label,
    url: item.html_url || null,
  };
}

let pending = null;

// 저장소들의 커밋을 최신순으로 합쳐서 돌려준다. 여러 컴포넌트가 불러도 요청은 한 번만 간다.
export function loadGithubActivity() {
  const cached = readCache();
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;

  const publicLists = TRACKED_REPOS.map(info =>
    fetch(`https://api.github.com/repos/${OWNER}/${info.repo}/commits?per_page=100`)
      .then(res => (res.ok ? res.json() : []))
      .then(items => items.map(item => toEntry(item, info)).filter(Boolean))
      .catch(() => [])
  );
  // 비공개 저장소: 남이 열 수 없는 주소라 링크는 붙이지 않는다.
  const privateLists = PRIVATE_SOURCES.map(info =>
    fetch(info.url)
      .then(res => (res.ok ? res.json() : { commits: [] }))
      .then(data =>
        (data.commits || [])
          .map(c => toEntry({ sha: c.sha, commit: { message: c.message, author: { date: c.date } } }, info))
          .filter(Boolean)
      )
      .catch(() => [])
  );

  pending = Promise.all([...publicLists, ...privateLists])
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
