// 방문자 위치와 현재 날씨를 가져온다. 모두 가입·키가 필요 없는 무료 서비스다.
//  - 날씨: Open-Meteo
//  - 위치·지역 이름: BigDataCloud
//    · 좌표 없이 부르면 접속 지역(IP) 기준 대략적인 위치 → 권한 요청 없이 페이지 첫 화면에 쓴다
//    · 좌표를 넘기면 그 위치의 지역 이름 → 위치 권한을 허용했을 때 쓴다

const SEOUL = { lat: 37.5665, lon: 126.978, place: '서울' };
const GEO_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export const WEATHER_INFO = {
  clear: { icon: '☀️', text: '맑음' },
  night: { icon: '🌙', text: '맑은 밤' },
  cloudy: { icon: '☁️', text: '흐림' },
  fog: { icon: '🌫️', text: '안개' },
  rain: { icon: '🌧️', text: '비' },
  storm: { icon: '⛈️', text: '뇌우' },
  snow: { icon: '❄️', text: '눈' },
};

// Open-Meteo 날씨 코드(WMO)를 화면 효과·배경음 분위기로 바꾼다.
function codeToKind(code, isDay) {
  if ([95, 96, 99].includes(code)) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 2 || code === 3) return isDay ? 'cloudy' : 'night';
  return isDay ? 'clear' : 'night';
}

const placeName = data => data.city || data.locality || data.principalSubdivision || null;

async function fetchWeatherAt(lat, lon) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      '&current=temperature_2m,weather_code,is_day&timezone=auto'
  );
  if (!res.ok) throw new Error('weather request failed');
  const data = await res.json();
  const kind = codeToKind(data.current.weather_code, data.current.is_day === 1);
  return { kind, temperature: Math.round(data.current.temperature_2m), ...WEATHER_INFO[kind] };
}

// v2: 해·달 위치 계산용 좌표(lat, lon)를 같이 저장
const APPROX_CACHE_KEY = 'yyw-weather-approx-v2';
const APPROX_CACHE_MS = 30 * 60 * 1000;

// 권한 요청 없이 접속 지역 기준으로 날씨를 가져온다. 실패하면 서울 기준.
// 응답이 2~3초씩 걸려서, 30분 동안은 저장해 둔 값을 바로 쓴다.
export async function loadApproxWeather() {
  try {
    const cached = JSON.parse(localStorage.getItem(APPROX_CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.savedAt < APPROX_CACHE_MS) return cached.weather;
  } catch {
    // 저장된 값 없이 계속
  }
  const weather = await fetchApproxWeather();
  try {
    localStorage.setItem(APPROX_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), weather }));
  } catch {
    // 무시
  }
  return weather;
}

async function fetchApproxWeather() {
  let spot = SEOUL;
  let source = 'fallback';
  try {
    const res = await fetch(`${GEO_API}?localityLanguage=ko`);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        spot = { lat: data.latitude, lon: data.longitude, place: placeName(data) || '현재 지역' };
        source = 'ip';
      }
    }
  } catch {
    // 서울 기준으로 계속
  }
  const weather = await fetchWeatherAt(spot.lat, spot.lon);
  return { ...weather, place: spot.place, source, lat: spot.lat, lon: spot.lon };
}

function getPosition() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 30 * 60 * 1000 }
    );
  });
}

// 위치 권한을 물어보고 정확한 위치의 날씨를 가져온다. 거부하면 null.
export async function loadPreciseWeather() {
  const pos = await getPosition();
  if (!pos) return null;
  const [weather, place] = await Promise.all([
    fetchWeatherAt(pos.lat, pos.lon),
    fetch(`${GEO_API}?latitude=${pos.lat}&longitude=${pos.lon}&localityLanguage=ko`)
      .then(res => (res.ok ? res.json() : {}))
      .then(placeName)
      .catch(() => null),
  ]);
  return { ...weather, place: place || '현재 위치', source: 'gps', lat: pos.lat, lon: pos.lon };
}
