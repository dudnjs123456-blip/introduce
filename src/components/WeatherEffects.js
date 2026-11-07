import React, { useEffect, useRef, useState } from 'react';
import { useWeather } from '../data/WeatherContext';
import './WeatherEffects.css';

// 페이지 전체 위에 깔리는 날씨 효과. 클릭은 그대로 아래 내용으로 통과한다.
//  비·뇌우: 빗줄기 (뇌우는 번개 번쩍임)   눈: 흩날리는 눈송이
//  맑음: 오른쪽 위 햇빛   밤: 화면을 어둡게 + 반짝이는 별   흐림·안개: 천천히 흐르는 구름·안개

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      {kind === 'clear' && (
        <div className="wx-sun">
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
      {kind === 'night' && <div className="wx-moon" />}
      {CANVAS_KINDS.includes(kind) && <canvas ref={canvasRef} className="wx-canvas" />}
      {kind === 'storm' && <div className={`wx-flash ${flash ? 'is-on' : ''}`} />}
    </div>
  );
};

export default WeatherEffects;
