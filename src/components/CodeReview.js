import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import './CodeReview.css';

// 매일 밤 Claude 가 저장소별 그날 커밋을 리뷰해 올린 글 (code_review_posts 테이블)
const REPO_LABELS = {
  'dudnjs123456-blip/ONE': 'IRON FIST',
  'dudnjs123456-blip/introduce': '포트폴리오',
  'dudnjs123456-blip/Albartoon': '알바툰',
  'dudnjs123456-blip/eywa-test': 'EYWA 테스트',
  'chrismathone/eywa': 'EYWA',
};
const repoLabel = (repo) => REPO_LABELS[repo] || repo.split('/').pop();

// 심각도: 고쳐야 함 → 주의 → 참고 → 잘한 점
const SEVERITY = {
  critical: { label: '수정 필요', order: 0 },
  warning: { label: '주의', order: 1 },
  info: { label: '참고', order: 2 },
  good: { label: '잘한 점', order: 3 },
};
const sevOf = (s) => (SEVERITY[s] ? s : 'info');

const formatDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

function Finding({ f }) {
  const sev = sevOf(f.severity);
  return (
    <div className={`cr-finding cr-sev-${sev}`}>
      <div className="cr-finding-head">
        <span className={`cr-badge cr-badge-${sev}`}>{SEVERITY[sev].label}</span>
        {f.category && <span className="cr-category">{f.category}</span>}
        <strong className="cr-finding-title">{f.title}</strong>
      </div>
      {f.file && <div className="cr-file">{f.file}</div>}
      {f.code && <pre className="cr-code"><code>{f.code}</code></pre>}
      {f.comment && <p className="cr-text">{f.comment}</p>}
      {f.suggestion && (
        <p className="cr-text cr-suggestion"><span>제안</span>{f.suggestion}</p>
      )}
    </div>
  );
}

function Post({ post, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const findings = [...(post.findings || [])].sort(
    (a, b) => SEVERITY[sevOf(a.severity)].order - SEVERITY[sevOf(b.severity)].order
  );
  const counts = findings.reduce((acc, f) => {
    const s = sevOf(f.severity);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <article className="cr-post">
      <button className="cr-post-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <div className="cr-post-meta">
          <span className="cr-repo">{repoLabel(post.repo)}</span>
          <time dateTime={post.review_date}>{formatDate(post.review_date)}</time>
          <span className="cr-commit-count">커밋 {post.commits?.length || 0}개</span>
        </div>
        <h3 className="cr-post-title">{post.title}</h3>
        <div className="cr-counts">
          {Object.keys(SEVERITY).filter((s) => counts[s]).map((s) => (
            <span key={s} className={`cr-badge cr-badge-${s}`}>{SEVERITY[s].label} {counts[s]}</span>
          ))}
          <span className="cr-toggle" aria-hidden="true">{open ? '접기 ▲' : '자세히 ▼'}</span>
        </div>
      </button>

      {open && (
        <div className="cr-post-body">
          {post.summary && <p className="cr-summary">{post.summary}</p>}
          {findings.map((f, i) => <Finding key={i} f={f} />)}
          {post.commits?.length > 0 && (
            <details className="cr-commits">
              <summary>리뷰한 커밋 {post.commits.length}개</summary>
              <ul>
                {post.commits.map((c) => (
                  <li key={c.sha}>
                    <a href={c.url || `https://github.com/${post.repo}/commit/${c.sha}`} target="_blank" rel="noopener noreferrer">
                      <code>{String(c.sha).slice(0, 7)}</code>
                    </a>{' '}
                    {c.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </article>
  );
}

export default function CodeReview() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [repo, setRepo] = useState('all');

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase
      .from('code_review_posts')
      .select('id, review_date, repo, title, summary, findings, commits')
      .order('review_date', { ascending: false })
      .order('repo')
      .limit(60)
      .then(({ data, error: err }) => {
        if (err) setError('리뷰를 불러오지 못했어요.');
        else setPosts(data);
        setLoading(false);
      });
  }, []);

  const repos = useMemo(() => [...new Set(posts.map((p) => p.repo))], [posts]);
  const shown = repo === 'all' ? posts : posts.filter((p) => p.repo === repo);

  if (!supabase) return <p className="cr-empty">리뷰 기능이 아직 연결되지 않았어요.</p>;

  return (
    <div className="cr-wrap">
      {repos.length > 1 && (
        <div className="cr-filters" role="tablist" aria-label="저장소">
          {['all', ...repos].map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={repo === r}
              className={`cr-chip${repo === r ? ' is-active' : ''}`}
              onClick={() => setRepo(r)}
            >
              {r === 'all' ? '전체' : repoLabel(r)}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="cr-empty">불러오는 중…</p>}
      {!loading && error && <p className="cr-error">{error}</p>}
      {!loading && !error && shown.length === 0 && (
        <p className="cr-empty">아직 올라온 리뷰가 없어요. 매일 밤 그날 커밋을 리뷰해서 올려요.</p>
      )}

      <div className="cr-list">
        {shown.map((p, i) => <Post key={p.id} post={p} defaultOpen={i === 0} />)}
      </div>
    </div>
  );
}
