import React from 'react';
import { useWeather } from '../data/WeatherContext';
import './Runner.css';

// 오른쪽 아래에서 계속 달리는 캐릭터. 첫 화면 일러스트의 주인공(보라색 곱슬머리·동그란 안경·초록 후드·파란 바지·초록 운동화)을
// 그대로 옮겨 그렸다. 누르면 페이지 맨 위로 올라간다.
// 팔·다리는 관절(어깨·팔꿈치·엉덩이·무릎)마다 따로 돌려서 자연스럽게 뛰는 동작을 만든다.

const OUTLINE = '#1d1f3f';

const COLORS = {
  front: { pants: '#7d93ec', sleeve: '#5fd39a', shoe: '#5fd39a' },
  back: { pants: '#5f74cf', sleeve: '#43b27c', shoe: '#43b27c' },
};

// 테두리(진한 남색) 위에 색을 한 번 더 그려 일러스트처럼 외곽선이 있는 팔다리를 만든다.
const Seg = ({ x1, y1, x2, y2, color, width = 5 }) => (
  <>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={OUTLINE} strokeWidth={width + 2} />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} />
  </>
);

const Leg = ({ side }) => {
  const c = COLORS[side];
  return (
    <g className={`runner-thigh leg-${side}`}>
      <Seg x1={30} y1={44} x2={30} y2={57} color={c.pants} width={6} />
      <g className="runner-shin">
        <Seg x1={30} y1={57} x2={30} y2={69} color={c.pants} width={5.5} />
        {/* 운동화: 초록 몸통 + 흰 밑창 */}
        <Seg x1={29} y1={71} x2={36} y2={71} color={c.shoe} width={4.5} />
        <line x1={28.5} y1={73.4} x2={36.5} y2={73.4} stroke="#ffffff" strokeWidth={1.4} />
      </g>
    </g>
  );
};

const Arm = ({ side }) => {
  const c = COLORS[side];
  return (
    <g className={`runner-upper-arm arm-${side}`}>
      <Seg x1={30} y1={28} x2={30} y2={37} color={c.sleeve} width={5} />
      <g className="runner-forearm">
        <Seg x1={30} y1={37} x2={30} y2={44} color={c.sleeve} width={4.5} />
        <circle cx={30} cy={45.5} r={2} fill="#ffffff" stroke={OUTLINE} strokeWidth={1} />
      </g>
    </g>
  );
};

const Runner = () => {
  const { weather } = useWeather() || {};
  const isNight = ['night', 'storm'].includes(weather?.kind);

  return (
  <button
    type="button"
    className={`runner ${isNight ? 'scene-night' : ''}`}
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    aria-label="맨 위로 가기"
    title="오늘도 달리는 중! (누르면 맨 위로)"
  >
    {/* 뒤로 지나가는 풍경: 먼 건물(느리게) → 가까운 나무·가로등(빠르게) */}
    <span className="runner-scene" aria-hidden="true">
      <span className="scene-far" />
      <span className="scene-mid" />
    </span>
    <svg viewBox="0 0 60 80" className="runner-svg" aria-hidden="true">
      <line className="runner-ground" x1="0" y1="76.5" x2="60" y2="76.5" />
      <ellipse className="runner-shadow" cx="31" cy="77" rx="10" ry="1.6" />

      <g className="runner-body">
        <Leg side="back" />
        <Arm side="back" />

        {/* 초록 후드티 몸통과 등 뒤 모자 */}
        <path d="M23.5 27 Q22 25 24.5 23.5 L27 23 L27 28 Z" fill="#5fd39a" stroke={OUTLINE} strokeWidth={1.2} />
        <rect x="23.5" y="24.5" width="13" height="22" rx="5.5" fill="#5fd39a" stroke={OUTLINE} strokeWidth={1.2} />
        <line x1="30.5" y1="27" x2="30.5" y2="33" stroke={OUTLINE} strokeWidth={0.8} />

        {/* 얼굴 */}
        <circle cx="31" cy="16" r="6.2" fill="#ffffff" stroke={OUTLINE} strokeWidth={1.2} />
        {/* 동그란 안경 */}
        <circle cx="32.6" cy="15.8" r="1.9" fill="none" stroke={OUTLINE} strokeWidth={0.9} />
        <circle cx="36.4" cy="15.8" r="1.6" fill="none" stroke={OUTLINE} strokeWidth={0.9} />
        <line x1="34.5" y1="15.6" x2="34.8" y2="15.6" stroke={OUTLINE} strokeWidth={0.8} />
        <path d="M33.5 19.2 Q35 20.2 36.3 19" fill="none" stroke={OUTLINE} strokeWidth={0.8} />
        {/* 보라색 곱슬머리 */}
        <g className="runner-hair" fill="#6f6ce0" stroke={OUTLINE} strokeWidth={1}>
          <circle cx="26.5" cy="13.5" r="3.2" />
          <circle cx="29" cy="10" r="3.4" />
          <circle cx="33" cy="9" r="3.2" />
          <circle cx="36.5" cy="10.8" r="2.6" />
          <circle cx="25.8" cy="17.5" r="2.4" />
        </g>

        <Leg side="front" />
        <Arm side="front" />
      </g>

      <g className="runner-dust">
        <circle cx="18" cy="74" r="1.4" />
        <circle cx="13" cy="73" r="1" />
      </g>
    </svg>
  </button>
  );
};

export default Runner;
