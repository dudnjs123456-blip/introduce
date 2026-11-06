import React, { useEffect, useState } from 'react';
import {
  GUESTBOOK_SHARED,
  MESSAGE_MAX,
  NAME_MAX,
  addComment,
  cooldownLeft,
  loadComments,
} from '../data/guestbook';
import './Guestbook.css';

const NAME_KEY = 'yyw-guestbook-name';

function timeAgo(iso) {
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return '방금';
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}일 전`;
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 통계 카드 안의 방명록. 버튼을 누르면 입력칸과 목록이 펼쳐진다.
const Guestbook = () => {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) || '';
    } catch {
      return '';
    }
  });
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState(''); // 사람 눈에는 안 보이는 칸. 채워져 있으면 자동 등록으로 보고 무시
  const [status, setStatus] = useState({ type: 'idle', text: '' }); // idle | saving | done | error

  useEffect(() => {
    let alive = true;
    loadComments()
      .then(list => alive && setComments(list))
      .catch(() => alive && setLoadFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const submit = async e => {
    e.preventDefault();
    if (status.type === 'saving') return;
    if (!name.trim() || !message.trim()) {
      setStatus({ type: 'error', text: '이름과 코멘트를 모두 적어 주세요.' });
      return;
    }
    if (trap) return;
    const wait = cooldownLeft();
    if (wait > 0) {
      setStatus({ type: 'error', text: `${wait}초 뒤에 다시 남길 수 있어요.` });
      return;
    }

    setStatus({ type: 'saving', text: '' });
    try {
      const saved = await addComment(name, message);
      setComments(list => [saved, ...(list || [])]);
      setMessage('');
      setLoadFailed(false);
      setStatus({ type: 'done', text: '코멘트를 남겼어요. 감사합니다!' });
      try {
        localStorage.setItem(NAME_KEY, name.trim());
      } catch {
        // 무시
      }
    } catch {
      setStatus({ type: 'error', text: '저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.' });
    }
  };

  const count = comments ? comments.length : null;

  return (
    <div className="guestbook">
      <button
        type="button"
        className={`guestbook-toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span aria-hidden="true">💬</span>
        {open ? '코멘트 닫기' : '코멘트 남기기'}
        {count !== null && <span className="guestbook-count">{count}</span>}
      </button>

      {open && (
        <div className="guestbook-panel">
          <form className="guestbook-form" onSubmit={submit}>
            <input
              className="guestbook-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={NAME_MAX}
              placeholder="이름"
              aria-label="이름"
              autoComplete="nickname"
            />
            <textarea
              className="guestbook-input guestbook-textarea"
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={MESSAGE_MAX}
              placeholder="남기고 싶은 말을 적어 주세요"
              aria-label="코멘트 내용"
              rows={3}
            />
            <input
              className="guestbook-trap"
              type="text"
              value={trap}
              onChange={e => setTrap(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <div className="guestbook-form-foot">
              <span className="guestbook-length">
                {message.length}/{MESSAGE_MAX}
              </span>
              <button type="submit" className="guestbook-submit" disabled={status.type === 'saving'}>
                {status.type === 'saving' ? '저장 중…' : '저장'}
              </button>
            </div>
            {status.text && (
              <p className={`guestbook-status is-${status.type}`} role="status">
                {status.text}
              </p>
            )}
            {!GUESTBOOK_SHARED && (
              <p className="guestbook-note">공용 저장소 연결 전이라 지금은 이 브라우저에만 저장돼요.</p>
            )}
          </form>

          <ul className="guestbook-list">
            {!comments && !loadFailed && <li className="guestbook-empty">불러오는 중…</li>}
            {loadFailed && <li className="guestbook-empty">코멘트를 불러오지 못했어요.</li>}
            {comments && comments.length === 0 && <li className="guestbook-empty">첫 코멘트를 남겨 주세요!</li>}
            {comments?.map(c => (
              <li key={c.id} className="guestbook-item">
                <div className="guestbook-item-head">
                  <strong>{c.name}</strong>
                  <time dateTime={c.created_at}>{timeAgo(c.created_at)}</time>
                </div>
                <p>{c.message}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Guestbook;
