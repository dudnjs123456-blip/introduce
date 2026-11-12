import React from 'react';
import './NightSky.css';

// 페이지 전체 배경. 게임 Together 메인 화면과 같은 밤하늘을 깐다.
// 크기·높이·속도·진하기를 다르게 한 구름 6개가 화면 위쪽에서 천천히 흘러간다.
const CLOUDS = [
  { top: '3%', size: 30, speed: 140, delay: -20, opacity: 0.16 },
  { top: '11%', size: 18, speed: 95, delay: -60, opacity: 0.12 },
  { top: '1%', size: 22, speed: 120, delay: -95, opacity: 0.13 },
  { top: '18%', size: 14, speed: 80, delay: -10, opacity: 0.09 },
  { top: '7%', size: 26, speed: 160, delay: -130, opacity: 0.14 },
  { top: '22%', size: 12, speed: 70, delay: -45, opacity: 0.08 },
];

const NightSky = () => (
  <div className="night-sky" aria-hidden="true">
    <div className="night-sky-stars" />
    <div className="night-sky-twinkle" />
    <svg className="night-sky-moon" viewBox="0 0 40 40">
      <path d="M27 5a15 15 0 1 0 8 26A13 13 0 1 1 27 5z" fill="#fff4c7" />
    </svg>
    <div className="night-sky-clouds">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="night-sky-cloud"
          style={{
            top: c.top,
            fontSize: `${c.size}px`,
            opacity: c.opacity,
            animationDuration: `${c.speed}s, ${6 + i}s`,
            animationDelay: `${c.delay}s, ${-i}s`,
            '--x': `${i * 17}vw`,
          }}
        />
      ))}
    </div>
  </div>
);

export default NightSky;
