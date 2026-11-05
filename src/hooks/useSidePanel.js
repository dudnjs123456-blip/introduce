import { useEffect, useState } from 'react';

// 이 너비 이상에서는 양옆 카드가 화면 가장자리에 붙고, 본문은 카드 사이 공간에만 놓인다.
// 더 좁으면 카드는 하단 버튼으로 접혔다가, 누르면 본문 위에 잠깐 열리는 창이 된다.
export const DOCK_QUERY = '(min-width: 1280px)';

const readClosed = key => {
  try {
    return localStorage.getItem(key) === 'closed';
  } catch {
    return false;
  }
};

const saveClosed = (key, closed) => {
  try {
    if (closed) localStorage.setItem(key, 'closed');
    else localStorage.removeItem(key);
  } catch {
    // 저장소를 못 쓰면 기억하지 않는다.
  }
};

// htmlClass: 카드가 붙어 있을 때 <html>에 붙는 클래스. CSS가 이걸 보고 본문 여백을 비워 둔다.
export function useSidePanel(storageKey, htmlClass) {
  const [docked, setDocked] = useState(() => window.matchMedia(DOCK_QUERY).matches);
  const [open, setOpenState] = useState(() => docked && !readClosed(storageKey));

  // 화면 너비가 기준선을 넘나들면: 넓어지면 (사용자가 닫아 둔 게 아니면) 펼치고, 좁아지면 접는다.
  useEffect(() => {
    const mq = window.matchMedia(DOCK_QUERY);
    const onChange = e => {
      setDocked(e.matches);
      setOpenState(e.matches && !readClosed(storageKey));
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [storageKey]);

  useEffect(() => {
    document.documentElement.classList.toggle(htmlClass, open && docked);
    return () => document.documentElement.classList.remove(htmlClass);
  }, [open, docked, htmlClass]);

  // 좁은 화면에서 열린 창은 Esc로 닫는다.
  useEffect(() => {
    if (!open || docked) return undefined;
    const onKey = e => e.key === 'Escape' && setOpenState(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, docked]);

  const setOpen = next => {
    setOpenState(next);
    // 넓은 화면에서 직접 닫은 경우만 기억한다.
    if (docked) saveClosed(storageKey, !next);
  };

  return { open, setOpen, docked };
}
