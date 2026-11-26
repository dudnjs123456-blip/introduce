# 윤여원 | 프론트엔드 개발자 포트폴리오

아이디어를 코드로 구현하는 프론트엔드 개발자 윤여원의 포트폴리오 사이트입니다.
React로 만들었고, 프로젝트마다 요약 카드와 발표 형식의 상세 슬라이드를 제공합니다.

## 담긴 프로젝트

| 프로젝트 | 내용 | 기술 |
|---|---|---|
| EYWA 학원 관리 시스템 | 학부모 셔틀 등하원 확인·변경 흐름, DB 저장, 변경 이력, 직원용 관리 화면 ([팀 저장소](https://github.com/BIGSHOL/eywa)) | Next.js, TypeScript, Supabase |
| AI 법령 코드 진단 | 깃 저장소 코드를 읽어 AI 기본법·개인정보보호법 등 AI 관련 법령 위반 가능성을 근거 줄과 함께 진단 ([써 보기](https://ai-law-scanner.vercel.app) · [코드](https://github.com/dudnjs123456-blip/ai-law-scanner)) | Next.js, Node.js, 정적 분석, GitHub API |
| 드론 배송 3D 시뮬레이터 | 아파트 단지 드론 16대 배송 시뮬레이션: 3D A* 경로 탐색, 시간-공간 예약 충돌 회피, 돌발 상황 6종 대응, 가게→도크 운반, 바람·날씨 영향과 안전 검증 ([써 보기](https://drone-delivery-sim-tau.vercel.app) · [코드](https://github.com/dudnjs123456-blip/drone-delivery-sim)) | Next.js, TypeScript, React Three Fiber, Vitest |
| Together (옛 이름 IRON FIST) | 웹 3D 격투 RPG: 격투 대전, 서울 생활 모드, 집 컴퓨터로 접속하는 공유 몬스터 차원과 NPC가 있는 경계 마을과 여럿이 묵는 여관 게스트하우스(차원 돈 은화), 대사마다 바뀌는 주인공 표정 그림, 실시간 멀티플레이, AI NPC 대화 ([플레이](https://tekken-web-five.vercel.app) · [코드](https://github.com/dudnjs123456-blip/ONE)) | Next.js, Three.js, Supabase Realtime, Claude API |
| 알바툰 | 알바 근무 관리 플랫폼: 출근부, 일정표, 실시간 채팅, 게시판, 근무일지, 구인 공고 ([코드](https://github.com/dudnjs123456-blip/Albartoon)) | React, Redux Toolkit, Node.js, MySQL, Socket.IO |
| 유튜브 채널 | 드라마 쇼츠 업스케일링, 최고 조회수 760만 | Premiere Pro |

## 실행

```bash
npm install
npm start       # http://localhost:3000
npm run build   # 배포용 빌드
```

## 구조

- `src/App.js` — 페이지 전체와 프로젝트 데이터(`projectsData`), 프로젝트 상세 모달
- `src/App.css` — 스타일
- `public/` — 프로젝트 스크린샷과 프로필 이미지

## 연락처

- Email: ghkfkddlqtl@naver.com
- GitHub: https://github.com/dudnjs123456-blip
