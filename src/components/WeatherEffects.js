import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useWeather } from '../data/WeatherContext';
import { DEG, moonIllumination, moonPosition, sunPosition } from '../data/sky';
import './WeatherEffects.css';

// 페이지 전체 위에 깔리는 날씨 효과. 클릭은 그대로 아래 내용으로 통과한다.
//  비·뇌우: 빗줄기 (뇌우는 번개 번쩍임)   눈: 흩날리는 눈송이
//  맑음: 오른쪽 위 해   밤: 화면을 어둡게 + 반짝이는 별 + 오른쪽 위 달   흐림·안개: 천천히 흐르는 구름·안개
// 해·달 자리는 고정. 실제 시각의 해 고도로 빛이 닿는 범위·색(아침·저녁은 주황빛)을, 달은 실제 위상을 정한다(1분마다 갱신).
// 미리보기: ?weather=clear&time=17:30 처럼 시각을 붙이면 그 시각 기준으로 본다.

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SEOUL = { lat: 37.5665, lon: 126.978 };

// ?time=HH:MM 이 있으면 오늘 그 시각(방문자 시계 기준), 없으면 지금
function skyTime() {
  const t = new URLSearchParams(window.location.search).get('time');
  const m = t && /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return new Date();
  const d = new Date();
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return d;
}

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = v => Math.max(0, Math.min(1, v));

/**
 * 해(맑음) 또는 달(밤)의 실제 고도 → 빛의 세기·색, 달 위상. 자리는 CSS 로 고정이다.
 * 지평선 아래여도 숨기지 않고 '낮은 해·달'로 다룬다.
 */
function useSkyBody(kind, weather) {
  const [body, setBody] = useState(null);

  useEffect(() => {
    if (kind !== 'clear' && kind !== 'night') {
      setBody(null);
      return undefined;
    }
    const lat = typeof weather?.lat === 'number' ? weather.lat : SEOUL.lat;
    const lon = typeof weather?.lon === 'number' ? weather.lon : SEOUL.lon;

    const update = () => {
      const now = skyTime();
      const isSun = kind === 'clear';
      const pos = isSun ? sunPosition(now, lat, lon) : moonPosition(now, lat, lon);
      const high = clamp01(Math.sin(Math.max(pos.altitude, 0)) / Math.sin(60 * DEG)); // 0 지평선 ~ 1 높이 뜸
      const moon = isSun ? null : moonIllumination(now);
      setBody({ isSun, high, moon, lat });
    };

    update();
    const timer = setInterval(update, 60 * 1000);
    return () => clearInterval(timer);
  }, [kind, weather]);

  return body;
}

/**
 * 빛이 닿는 범위: 해·달 자리에서 퍼져 나가 거리만큼 약해지고, 닿지 않는 먼 쪽은 살짝 그늘진다.
 * 해가 높으면 넓고 하얗게, 낮으면(아침·저녁) 좁고 주황빛으로. 달빛은 밝은 부분 비율만큼 푸르스름하게.
 */
function lightStyle(body, { x, y }) {
  const { high, isSun, moon } = body;
  if (isSun) {
    const reach = lerp(45, 110, high); // vmax
    const r = Math.round(lerp(255, 255, high));
    const g = Math.round(lerp(176, 240, high));
    const b = Math.round(lerp(96, 210, high));
    // 처음 들어온 사람이 거슬리지 않게 아주 은은하게 (달빛 정도)
    const a = lerp(0.06, 0.035, high).toFixed(3);
    const shade = lerp(0.1, 0.03, high).toFixed(3);
    return {
      background:
        `radial-gradient(circle at ${x}px ${y}px, rgba(${r}, ${g}, ${b}, ${a}) 0%, rgba(${r}, ${g}, ${b}, ${(a * 0.45).toFixed(3)}) ${reach * 0.35}vmax, rgba(${r}, ${g}, ${b}, 0) ${reach * 0.7}vmax, rgba(0, 0, 0, 0) ${reach * 0.8}vmax, rgba(0, 0, 0, ${shade}) ${reach * 1.25}vmax)`,
    };
  }
  const f = moon ? moon.fraction : 0.5;
  const reach = lerp(25, 70, f);
  const a = (0.07 * f + 0.01).toFixed(3);
  return {
    background: `radial-gradient(circle at ${x}px ${y}px, rgba(190, 210, 255, ${a}) 0%, rgba(190, 210, 255, 0) ${reach}vmax)`,
  };
}

// 달 위상 그림: 밝은 쪽 반원 + 명암 경계(타원 호). 북반구는 차오를 때 오른쪽이 밝다.
function moonPath(fraction, rightLit) {
  const rx = Math.abs(1 - 2 * fraction) * 50;
  const gibbous = fraction > 0.5;
  const outer = rightLit ? 1 : 0;
  const inner = rightLit ? (gibbous ? 1 : 0) : gibbous ? 0 : 1;
  return `M50 0 A50 50 0 0 ${outer} 50 100 A${rx.toFixed(2)} 50 0 0 ${inner} 50 0 Z`;
}

const Moon = React.forwardRef(function Moon({ body }, ref) {
  const { fraction, waxing } = body.moon;
  const rightLit = body.lat >= 0 ? waxing : !waxing;
  return (
    <div className="wx-moon" ref={ref}>
      <svg viewBox="0 0 100 100" className="wx-moon-svg">
        <defs>
          <radialGradient id="wxMoonLit" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#fbfbf5" />
            <stop offset="70%" stopColor="#dedcd2" />
            <stop offset="100%" stopColor="#c4c2b8" />
          </radialGradient>
        </defs>
        {/* 그늘진 부분도 희미하게 보인다(지구조) */}
        <circle cx="50" cy="50" r="50" fill="rgba(160, 170, 190, 0.1)" />
        <path d={moonPath(fraction, rightLit)} fill="url(#wxMoonLit)" />
        {/* 바다(어두운 무늬) */}
        <g fill="rgba(120, 118, 110, 0.16)">
          <circle cx="38" cy="36" r="10" />
          <circle cx="60" cy="58" r="13" />
          <circle cx="40" cy="66" r="7" />
        </g>
      </svg>
    </div>
  );
});

function makeParticles(kind, w, h) {
  const area = w * h;
  const rand = (a, b) => a + Math.random() * (b - a);

  if (kind === 'rain' || kind === 'storm') {
    const count = Math.round((area / 9000) * (kind === 'storm' ? 1.6 : 1));
    return Array.from({ length: count }, () => ({
      x: rand(0, w),
      y: rand(-h, h),
      len: rand(10, 24),
      speed: rand(0.7, 1.15), // 화면 높이 기준 초당 이동 비율
      alpha: rand(0.12, 0.32),
    }));
  }
  if (kind === 'snow') {
    return Array.from({ length: Math.round(area / 12000) }, () => ({
      x: rand(0, w),
      y: rand(-h, h),
      r: rand(1, 3.2),
      speed: rand(0.04, 0.11),
      sway: rand(0.4, 1.4),
      phase: rand(0, Math.PI * 2),
      alpha: rand(0.45, 0.9),
    }));
  }
  if (kind === 'night') {
    return Array.from({ length: Math.round(area / 7000) }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.4, 1.3),
      phase: rand(0, Math.PI * 2),
      twinkle: rand(0.6, 2),
      alpha: rand(0.25, 0.8),
    }));
  }
  return [];
}

function drawFrame(ctx, kind, particles, w, h, dt, time) {
  ctx.clearRect(0, 0, w, h);

  if (kind === 'rain' || kind === 'storm') {
    const wind = kind === 'storm' ? -0.32 : -0.18; // 빗줄기 기울기
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    particles.forEach(p => {
      p.y += p.speed * h * dt * 1.4;
      p.x += p.speed * h * dt * 1.4 * wind;
      if (p.y > h + p.len) {
        p.y = -p.len - Math.random() * 60;
        p.x = Math.random() * (w + 200);
      }
      ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.len * wind, p.y + p.len);
      ctx.stroke();
    });
    return;
  }

  if (kind === 'snow') {
    particles.forEach(p => {
      p.y += p.speed * h * dt;
      p.x += Math.sin(time * p.sway + p.phase) * 0.35;
      if (p.y > h + 5) {
        p.y = -5;
        p.x = Math.random() * w;
      }
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    return;
  }

  if (kind === 'night') {
    particles.forEach(p => {
      const a = p.alpha * (0.55 + 0.45 * Math.sin(time * p.twinkle + p.phase));
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

const CANVAS_KINDS = ['rain', 'storm', 'snow', 'night'];

const WeatherEffects = () => {
  const { weather, effectsOn } = useWeather();
  const canvasRef = useRef(null);
  const [flash, setFlash] = useState(false);
  const kind = effectsOn && weather ? weather.kind : null;
  const body = useSkyBody(kind, weather);
  const bodyRef = useRef(null);
  const [anchor, setAnchor] = useState(null);

  // 빛의 중심 = 고정된 해·달 자리(화면 크기·통계 카드 자리에 따라 CSS 가 정함)를 재서 쓴다
  useLayoutEffect(() => {
    if (!body) return undefined;
    const measure = () => {
      const r = bodyRef.current?.getBoundingClientRect();
      if (r) setAnchor({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };
    measure();
    window.addEventListener('resize', measure);
    const later = setTimeout(measure, 600); // 통계 카드가 붙으며 자리가 바뀌는 경우
    return () => {
      window.removeEventListener('resize', measure);
      clearTimeout(later);
    };
  }, [body?.isSun, body?.moon ? 1 : 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // 빗줄기·눈송이·별 애니메이션
  useEffect(() => {
    if (!kind || !CANVAS_KINDS.includes(kind)) return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let particles = [];
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = makeParticles(kind, w, h);
    };
    resize();
    window.addEventListener('resize', resize);

    if (reducedMotion()) {
      // 움직임 줄이기 설정: 한 장면만 그린다.
      drawFrame(ctx, kind, particles, w, h, 0, 0);
    } else {
      const loop = now => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        drawFrame(ctx, kind, particles, w, h, dt, now / 1000);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [kind]);

  // 뇌우: 가끔 번개가 두 번 번쩍인다.
  useEffect(() => {
    if (kind !== 'storm' || reducedMotion()) return undefined;
    let timer;
    const strike = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 700);
      timer = setTimeout(strike, 8000 + Math.random() * 12000);
    };
    timer = setTimeout(strike, 3000);
    return () => clearTimeout(timer);
  }, [kind]);

  if (!kind) return null;

  return (
    <div className={`wx-layer wx-${kind}`} aria-hidden="true">
      <div className="wx-tint" />
      {body && anchor && <div className="wx-light" style={lightStyle(body, anchor)} />}
      {body?.isSun && (
        <div
          ref={bodyRef}
          className={`wx-sun${body.high < 0.25 ? ' is-low' : ''}`}
        >
          <div className="wx-sun-halo" />
          <div className="wx-sun-rays" />
          <div className="wx-sun-disc" />
          <div className="wx-sun-flare">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
      {(kind === 'cloudy' || kind === 'fog') && (
        <div className="wx-clouds">
          <span />
          <span />
          <span />
        </div>
      )}
      {body && !body.isSun && body.moon && <Moon body={body} ref={bodyRef} />}
      {CANVAS_KINDS.includes(kind) && <canvas ref={canvasRef} className="wx-canvas" />}
      {kind === 'storm' && <div className={`wx-flash ${flash ? 'is-on' : ''}`} />}
    </div>
  );
};

export default WeatherEffects;
