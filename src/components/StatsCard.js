import React, { useEffect, useRef, useState } from 'react';
import { loadGithubActivity } from '../data/githubActivity';
import { loadVisitors } from '../data/visitors';
import { useWeather } from '../data/WeatherContext';
import { createWeatherAudio } from '../audio/weatherAudio';
import { useSidePanel } from '../hooks/useSidePanel';
import './StatsCard.css';


function relativeDay(dateLike) {
  const start = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((start(new Date()) - start(new Date(dateLike))) / 86400000);
  if (diff <= 0) return '오늘';
  if (diff === 1) return '어제';
  return `${diff}일 전`;
}

const formatCount = value => (value === null || value === undefined ? '–' : value.toLocaleString('ko-KR'));

// 화면 오른쪽에 고정되는 방문 통계 카드 + 날씨 배경음 버튼
const StatsCard = () => {
  const { open, setOpen, docked } = useSidePanel('yyw-stats-v2', 'stats-docked');
  const [visitors, setVisitors] = useState({ today: undefined, total: undefined });
  const [activity, setActivity] = useState(null);
  const { weather, requestPrecise, effectsOn, setEffectsOn } = useWeather();
  const [soundState, setSoundState] = useState('off'); // off | loading | on | error
  const audioRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadVisitors().then(v => alive && setVisitors(v));
    loadGithubActivity().then(list => {
      if (!alive) return;
      const monthAgo = Date.now() - 30 * 86400000;
      setActivity({
        lastUpdate: list[0]?.date || null,
        recentCount: list.filter(c => new Date(c.date) >= monthAgo).length,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  // 페이지를 떠나면 소리를 끈다.
  useEffect(() => () => audioRef.current?.stop(), []);

  const toggleSound = async () => {
    if (soundState === 'loading') return;

    if (soundState === 'on') {
      const audio = audioRef.current;
      audioRef.current = null;
      setSoundState('off');
      await audio?.stop();
      return;
    }

    // 클릭한 순간 오디오를 열어 둬야 브라우저가 재생을 막지 않는다.
    const audio = createWeatherAudio();
    audio.unlock();
    audioRef.current = audio;
    setSoundState('loading');

    try {
      // 처음엔 접속 지역 기준 날씨라, 배경음을 켤 때 정확한 위치를 한 번 물어본다. 거부하면 지금 날씨 그대로.
      const info = (weather?.source !== 'gps' && (await requestPrecise())) || weather;
      if (!info) throw new Error('no weather');
      if (audioRef.current !== audio) return; // 불러오는 사이에 꺼졌으면 중단
      audio.play(info.kind);
      setSoundState('on');
    } catch {
      audio.stop();
      audioRef.current = null;
      setSoundState('error');
    }
  };

  const soundLabel = {
    off: '날씨 배경음 켜기',
    loading: '날씨 확인 중…',
    on: '배경음 끄기',
    error: '다시 시도',
  }[soundState];

  return (
    <>
    {open && !docked && <div className="panel-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    <aside className={`stats-card ${open ? 'is-open' : 'is-collapsed'}`} aria-label="방문 통계">
      {open ? (
        <>
          <div className="stats-head">
            <h2 className="stats-title">
              <span className="stats-live" aria-hidden="true" />
              방문 현황
              <span className="stats-live-label">LIVE</span>
            </h2>
            <button type="button" className="stats-toggle" onClick={() => setOpen(false)} aria-label="통계 카드 접기">
              –
            </button>
          </div>

          <dl className="stats-grid">
            <div className="stats-item stats-item-main">
              <dt>오늘 방문자</dt>
              <dd>
                {formatCount(visitors.today)}
                <small>명</small>
              </dd>
            </div>
            <div className="stats-item">
              <dt>전체 방문자</dt>
              <dd>
                {formatCount(visitors.total)}
                <small>명</small>
              </dd>
            </div>
            <div className="stats-item">
              <dt>30일 커밋</dt>
              <dd>
                {activity ? activity.recentCount : '–'}
                <small>개</small>
              </dd>
            </div>
            <div className="stats-item stats-item-wide">
              <dt>마지막 업데이트</dt>
              <dd className="stats-text">{activity?.lastUpdate ? relativeDay(activity.lastUpdate) : '–'}</dd>
            </div>
          </dl>

          <div className="stats-weather">
            {weather ? (
              <p className="stats-weather-now">
                <span className="stats-weather-icon" aria-hidden="true">
                  {weather.icon}
                </span>
                {weather.place} · {weather.text} {weather.temperature}°C
              </p>
            ) : (
              <p className="stats-weather-hint">
                {soundState === 'error' ? '날씨를 불러오지 못했어요.' : '지금 계신 곳의 날씨를 확인하고 있어요.'}
              </p>
            )}
            {weather?.source === 'fallback' && <p className="stats-weather-note">위치를 알 수 없어 서울 기준이에요.</p>}
            {weather?.preview && <p className="stats-weather-note">미리보기 중인 날씨예요.</p>}
            {weather && (
              <button
                type="button"
                className="stats-fx-toggle"
                onClick={() => setEffectsOn(!effectsOn)}
                aria-pressed={effectsOn}
              >
                화면 날씨 효과 {effectsOn ? '끄기' : '켜기'}
              </button>
            )}
            <button
              type="button"
              className={`stats-sound sound-${soundState}`}
              onClick={toggleSound}
              aria-pressed={soundState === 'on'}
            >
              <span className="stats-sound-icon" aria-hidden="true">
                {soundState === 'on' ? (
                  <span className="sound-bars">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  '🔊'
                )}
              </span>
              {soundLabel}
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="stats-pill" onClick={() => setOpen(true)} aria-label="방문 통계 열기">
          <span className="stats-live" aria-hidden="true" />
          오늘 {formatCount(visitors.today)}명
          {soundState === 'on' && (
            <span className="sound-bars" aria-label="배경음 재생 중">
              <i />
              <i />
              <i />
            </span>
          )}
        </button>
      )}
    </aside>
    </>
  );
};

export default StatsCard;
