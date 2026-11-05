import React, { useEffect, useMemo, useState } from 'react';
import { loadGithubActivity, localDateKey } from '../data/githubActivity';
import { useSidePanel } from '../hooks/useSidePanel';
import './UpdateLog.css';

const INITIAL_DAYS = 6;

function formatDay(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${weekday})`;
}

// 화면 왼쪽에 고정되는 업데이트 기록. GitHub 커밋을 날짜별로 묶어서 보여준다.
const UpdateLog = () => {
  const { open, setOpen, docked } = useSidePanel('yyw-update-log-v2', 'log-docked');
  const [commits, setCommits] = useState(null);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    loadGithubActivity()
      .then(list => {
        if (!alive) return;
        setCommits(list);
        setFailed(list.length === 0);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const days = useMemo(() => {
    if (!commits) return [];
    const map = new Map();
    commits.forEach(c => {
      const key = localDateKey(c.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    });
    return Array.from(map.entries());
  }, [commits]);

  const visibleDays = showAll ? days : days.slice(0, INITIAL_DAYS);
  const todayKey = localDateKey(new Date());

  return (
    <>
      {open && !docked && <div className="panel-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      <button
        type="button"
        className={`update-log-tab ${open ? 'is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="업데이트 기록 열기"
      >
        <span className="update-log-tab-dot" aria-hidden="true" />
        업데이트 기록
      </button>

      <aside className={`update-log ${open ? 'is-open' : ''}`} aria-label="업데이트 기록" aria-hidden={!open}>
        <div className="update-log-head">
          <div>
            <p className="update-log-eyebrow">GitHub 커밋 기준</p>
            <h2 className="update-log-title">업데이트 기록</h2>
          </div>
          <button type="button" className="update-log-close" onClick={() => setOpen(false)} aria-label="업데이트 기록 닫기">
            ✕
          </button>
        </div>

        <div className="update-log-body">
          {!commits && !failed && <p className="update-log-empty">기록을 불러오는 중…</p>}
          {failed && (
            <p className="update-log-empty">
              기록을 불러오지 못했어요.{' '}
              <a href="https://github.com/dudnjs123456-blip" target="_blank" rel="noopener noreferrer">
                GitHub에서 보기
              </a>
            </p>
          )}

          {visibleDays.map(([key, items]) => (
            <div className="update-day" key={key}>
              <h3 className="update-day-date">
                {formatDay(key)}
                {key === todayKey && <span className="update-day-today">오늘</span>}
              </h3>
              <ul className="update-day-list">
                {items.map(item => (
                  <li key={item.sha} className="update-item">
                    <div className="update-item-meta">
                      <span className="update-item-repo">{item.repoLabel}</span>
                      <span className={`update-item-type type-${item.type}`}>{item.typeLabel}</span>
                    </div>
                    <a className="update-item-text" href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {days.length > INITIAL_DAYS && (
            <button type="button" className="update-log-more" onClick={() => setShowAll(v => !v)}>
              {showAll ? '접기' : `이전 기록 ${days.length - INITIAL_DAYS}일 더 보기`}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default UpdateLog;
