// 해·달의 실제 위치(고도·방위)와 달의 위상 계산.
// 공식은 SunCalc(Vladimir Agafonkin, BSD-2) 와 같은 천문 근사식이다. 화면 연출용이라 오차 1° 안팎이면 충분하다.
//   altitude: 지평선 위 각도(라디안, 음수면 지평선 아래)
//   azimuth : 남쪽 0, 서쪽 +, 동쪽 − (라디안)

const RAD = Math.PI / 180;
const DAY_MS = 86400000;
const J1970 = 2440588;
const J2000 = 2451545;
const OBLIQUITY = RAD * 23.4397; // 지구 자전축 기울기

const toDays = date => date.valueOf() / DAY_MS - 0.5 + J1970 - J2000;

const rightAscension = (l, b) =>
  Math.atan2(Math.sin(l) * Math.cos(OBLIQUITY) - Math.tan(b) * Math.sin(OBLIQUITY), Math.cos(l));
const declination = (l, b) =>
  Math.asin(Math.sin(b) * Math.cos(OBLIQUITY) + Math.cos(b) * Math.sin(OBLIQUITY) * Math.sin(l));
const azimuthOf = (H, phi, dec) => Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi));
const altitudeOf = (H, phi, dec) =>
  Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
const siderealTime = (d, lw) => RAD * (280.16 + 360.9856235 * d) - lw;

function sunCoords(d) {
  const M = RAD * (357.5291 + 0.98560028 * d); // 평균 근점 이각
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + RAD * 102.9372 + Math.PI; // 황경
  return { dec: declination(L, 0), ra: rightAscension(L, 0) };
}

function moonCoords(d) {
  const L = RAD * (218.316 + 13.176396 * d);
  const M = RAD * (134.963 + 13.064993 * d);
  const F = RAD * (93.272 + 13.22935 * d);
  const l = L + RAD * 6.289 * Math.sin(M);
  const b = RAD * 5.128 * Math.sin(F);
  return { ra: rightAscension(l, b), dec: declination(l, b), dist: 385001 - 20905 * Math.cos(M) };
}

// 지평선 근처에서 대기 굴절로 살짝 떠 보이는 만큼
function refraction(h) {
  const a = Math.max(h, 0);
  return 0.0002967 / Math.tan(a + 0.00312536 / (a + 0.08901179));
}

export function sunPosition(date, lat, lon) {
  const d = toDays(date);
  const c = sunCoords(d);
  const H = siderealTime(d, RAD * -lon) - c.ra;
  return { altitude: altitudeOf(H, RAD * lat, c.dec), azimuth: azimuthOf(H, RAD * lat, c.dec) };
}

export function moonPosition(date, lat, lon) {
  const d = toDays(date);
  const c = moonCoords(d);
  const H = siderealTime(d, RAD * -lon) - c.ra;
  const h = altitudeOf(H, RAD * lat, c.dec);
  return { altitude: h + refraction(h), azimuth: azimuthOf(H, RAD * lat, c.dec) };
}

// fraction: 밝은 부분 비율(0 삭 ~ 1 보름) · waxing: 차오르는 중(상현 쪽)인지
export function moonIllumination(date) {
  const d = toDays(date);
  const s = sunCoords(d);
  const m = moonCoords(d);
  const SUN_DIST = 149598000;
  const phi = Math.acos(
    Math.sin(s.dec) * Math.sin(m.dec) + Math.cos(s.dec) * Math.cos(m.dec) * Math.cos(s.ra - m.ra)
  );
  const inc = Math.atan2(SUN_DIST * Math.sin(phi), m.dist - SUN_DIST * Math.cos(phi));
  const angle = Math.atan2(
    Math.cos(s.dec) * Math.sin(s.ra - m.ra),
    Math.sin(s.dec) * Math.cos(m.dec) - Math.cos(s.dec) * Math.sin(m.dec) * Math.cos(s.ra - m.ra)
  );
  const phase = 0.5 + (0.5 * inc * (angle < 0 ? -1 : 1)) / Math.PI;
  return { fraction: (1 + Math.cos(inc)) / 2, waxing: phase < 0.5 };
}

export const DEG = RAD;
