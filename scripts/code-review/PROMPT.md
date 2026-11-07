# 매일 코드 리뷰 — 예약 작업 지시문

클라우드 예약 작업(Claude Code routine)이 매일 00:10(한국 시간)에 이 지시를 따른다.
글쓰기 키(REVIEW_KEY)는 이 파일에 없고 예약 작업 설정에만 있다.

## 할 일

**어제(한국 시간, Asia/Seoul) 하루 동안** 아래 저장소에 올라온 커밋을 저장소별로 읽고,
저장소마다 리뷰 글 1개를 써서 포트폴리오 사이트에 올린다.

대상 저장소 (작업 폴더에 클론되어 있음 — `ls` 로 위치 확인):
- dudnjs123456-blip/ONE — IRON FIST, 웹 3D 격투 RPG (Next.js, TypeScript, Three.js, Supabase)
- dudnjs123456-blip/introduce — 포트폴리오 사이트 (React CRA)
- dudnjs123456-blip/Albartoon — 알바 근무 관리 플랫폼
- dudnjs123456-blip/eywa-test — EYWA 개인 테스트 저장소

리뷰하지 않는 저장소: chrismathone/eywa (EYWA 팀 저장소 — 팀 코드를 공개 포폴에 올리지 않기로 함, 2026-11-07)

## 순서

1. 날짜 계산: `TZ=Asia/Seoul date -d yesterday +%F` → REVIEW_DATE.
   범위는 `REVIEW_DATE 00:00:00 +09:00` ~ `REVIEW_DATE 23:59:59 +09:00`.
2. 저장소마다:
   - 클론이 얕을 수 있으니 `git fetch --all --quiet --shallow-since="7 days ago"` (실패하면 `git fetch --all --unshallow`).
   - `git log --remotes --no-merges --since=... --until=... --format='%H%x09%an%x09%s'` 로 커밋 목록.
     여러 브랜치에 같은 커밋이 있으면 한 번만.
   - 커밋이 하나도 없으면 그 저장소는 건너뛴다 (글을 올리지 않음).
   - `git show --stat <sha>` 로 바뀐 파일을 훑고, 중요해 보이는 파일은 `git show <sha> -- <file>` 로 diff 를 자세히 읽는다.
     필요하면 해당 파일 전체를 열어 앞뒤 맥락을 확인한다. lock 파일·빌드 결과물·이미지·자동 생성 파일은 건너뛴다.
3. 리뷰 항목(findings) 고르기 — 저장소당 3~6개, 정말 중요한 것만:
   - `critical` 수정 필요: 버그, 보안 문제(키 노출, 권한 누락, XSS/SQL 인젝션), 데이터 손실, 깨질 게 확실한 코드
   - `warning` 주의: 경쟁 조건, 성능 문제, 예외 처리 누락, 나중에 문제 될 설계
   - `info` 참고: 이해할 가치가 있는 핵심 로직 설명, 개선 아이디어
   - `good` 잘한 점: 좋은 구조나 해법 (최소 1개는 넣어 균형을 맞춘다)
   추측이 아닌, 코드에서 직접 확인한 것만 쓴다. 확신이 낮으면 `warning`/`info` 로 낮추고 "확인 필요"라고 적는다.
4. 글 JSON 을 저장소마다 파일로 만든다 (예: `/tmp/review-ONE.json`):

```json
{
  "review_date": "2026-11-06",
  "repo": "dudnjs123456-blip/ONE",
  "title": "보스 레이드 판정 개선 — 한 줄로 그날 작업의 핵심",
  "summary": "그날 무엇을 했는지 3~5문장. 전체적인 평가 포함.",
  "findings": [
    {
      "severity": "critical | warning | info | good",
      "category": "버그 | 보안 | 성능 | 구조 | 가독성 | 테스트 | 핵심 로직 등",
      "file": "src/game/boss/raid.ts:120",
      "title": "한 문장 요약",
      "code": "문제 코드 발췌 (최대 15줄)",
      "comment": "왜 중요한지, 어떤 상황에서 문제가 되는지",
      "suggestion": "어떻게 고치면 좋은지 (필요 없으면 빈 문자열)"
    }
  ],
  "commits": [
    { "sha": "전체 40자 해시", "message": "커밋 제목", "url": "https://github.com/<repo>/commit/<sha>" }
  ]
}
```

5. 올리기: `cd <introduce 클론 폴더> && REVIEW_KEY=<키> node scripts/code-review/publish.mjs /tmp/review-*.json`
   `OK ...` 가 저장소 수만큼 나오면 끝. 실패하면 메시지를 보고 JSON 을 고쳐 다시 올린다.

## 규칙

- 모든 글은 **한국어**로, 개발자가 읽기 좋은 리뷰 톤으로 쓴다.
- 이 글은 공개 포트폴리오에 그대로 보인다. 코드 발췌에 API 키·비밀번호·토큰·개인정보가 있으면 `***` 로 가린다.
- 저장소 코드를 수정·커밋·push 하지 않는다. 리뷰를 올리는 것만 한다.
- 키(REVIEW_KEY)를 파일로 저장하거나 출력하지 않는다.
- 마지막에 저장소별 커밋 수, 올린 글 제목을 짧게 보고한다.
