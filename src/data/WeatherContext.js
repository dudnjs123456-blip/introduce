import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { WEATHER_INFO, loadApproxWeather, loadPreciseWeather } from './weather';

// 통계 카드(날씨 표시·배경음)와 러너 게임이 같은 날씨 정보를 쓰도록 묶어 둔다.
const WeatherContext = createContext(null);

// 주소 뒤에 ?weather=rain 처럼 붙이면 실제 날씨 대신 그 날씨로 미리 볼 수 있다.
function previewKind() {
  const kind = new URLSearchParams(window.location.search).get('weather');
  return WEATHER_INFO[kind] ? kind : null;
}

function withPreview(weather) {
  const kind = previewKind();
  if (!kind || !weather) return weather;
  return { ...weather, kind, ...WEATHER_INFO[kind], preview: true };
}

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let alive = true;
    loadApproxWeather()
      .then(w => alive && setWeather(withPreview(w)))
      .catch(() => {
        // 날씨를 못 불러와도 미리보기 값이 있으면 그걸로 보여준다.
        const kind = previewKind();
        if (alive && kind) setWeather({ kind, ...WEATHER_INFO[kind], place: '미리보기', preview: true });
      });
    return () => {
      alive = false;
    };
  }, []);

  // 정확한 위치로 다시 확인. 권한을 거부하면 지금 값을 그대로 쓴다.
  const requestPrecise = useCallback(async () => {
    const precise = await loadPreciseWeather().catch(() => null);
    if (precise) {
      const next = withPreview(precise);
      setWeather(next);
      return next;
    }
    return null;
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, requestPrecise }}>
      {children}
    </WeatherContext.Provider>
  );
}

export const useWeather = () => useContext(WeatherContext);
