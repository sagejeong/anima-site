# ANiMA 웹

기침 소리를 녹음하면 평소 기침과 얼마나 달라졌는지 보여주는 서비스입니다. 원래는
독거노인·1인 가구가 스스로 체크하는 용도로 시작했고, 지금은 요양시설에서 입소자가
본인 폰으로 오전/오후 체크인하면 관리자가 대시보드에서 전체 현황을 보는 방향으로
범위를 넓히고 있습니다. (하드웨어 기기는 2026-09-15에 개발 안 하기로 결정, 지금은
완전히 소프트웨어로만 함)

팀원들이 스택이나 배포 방식 헷갈려 할 때마다 여기 와서 확인하면 되게 정리해둔
문서입니다.

현재 상태 요약:
- 입소자 체크인(`/checkin`)이든 앱으로 등록한 UUID 기반 실시간 연동(`/dashboard`)이든,
  FastAPI 분석까지 전부 실제로 동작합니다.
- "대시보드 보기"(`/dashboard-start`)를 누르면 둘로 나뉩니다: 더미 데이터만 보는
  데모버전(`/dashboard-demo`, 로그인 불필요)과, 관리자 로그인 후 실제 팀원 데이터가
  그대로 쌓이는 진짜 대시보드(`/dashboard`).
- `/dashboard/*`는 아이디+비밀번호(`ANIMA_ADMIN_ID`/`ANIMA_ADMIN_PASSWORD`)로 막혀 있고,
  로그인은 `/admin/login`에서.
- 입소자 명단·체크인 기록은 아직 파일(`lib/hub-roster.ts`)에 저장 중이라 정식 서비스 가기 전에
  DB로 옮겨야 함. 아래 5번에 자세히 적어둠.

---

## 1. 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16.3.0 (App Router, Turbopack) |
| UI | React / React DOM 19.2.8 |
| 언어 | TypeScript ^5 |
| 스타일 | Tailwind CSS ^4 (config 파일 없이 `app/globals.css`의 `@theme`에서 전부 관리) |
| 린트 | ESLint ^9 / eslint-config-next 16.3.0 |
| Node | 20.9.0 이상 (Next 16이 요구함) |

```bash
node -v   # 20.9.0 이상, 22/24 LTS도 무방
npm install
npm run dev   # localhost:3000
```

```bash
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint
```

### 폰트, 색

기존 소비자 페이지(녹음/기록/설정 등)는 Geist + 나눔명조 조합을 쓰고, 대시보드 쪽은
Calistoga/Inter에 한글 폰트(Gothic A1, Noto Sans KR)를 뒤에 붙여서 씁니다. 둘이 안
섞이게 `--font-hub-*` 토큰으로 따로 뺐습니다.

색은 Tailwind v4라 `tailwind.config.js`가 없고, `app/globals.css`의 `@theme` 블록
CSS 변수가 전부입니다. 화이트 톤 배경 + 브랜드 주황(`--color-primary`) 포인트. 색
바꿀 일 있으면 이 파일만 고치면 사이트 전체가 같이 바뀝니다(컴포넌트는 전부 토큰만
참조).

로고는 두 개 씁니다: `public/anima_logo.png`(일반 사이트), `public/anima_hub_logo.png`
(대시보드/관리자 쪽). 둘 다 파일 그대로 쓰고 텍스트로 다시 만들거나 색 바꾸지 않습니다.

---

## 2. 폴더 구조

```
app/
  page.tsx                   랜딩. 녹음·분석이랑 대시보드 두 실제 기능으로 들어가는 입구
  checkin/                    입소자용 체크인 화면 (본인 폰, 이름 등록 후 오전/오후 녹음)
  admin/login/                관리자 로그인 (아이디+비밀번호, proxy.ts가 쿠키로 검사)
  dashboard-start/            "대시보드 보기" 누르면 먼저 오는 선택 화면(데모 / 관리자 로그인)
  dashboard-demo/             로그인 불필요, 더미 데이터로만 동작 방식을 보여주는 데모
  dashboard/                  AppShell로 감싼 실제 대시보드 전체, 관리자 로그인 필요
    page.tsx                    전체현황 — 앱 UUID 등록하면 실제 측정 결과 반영, 예시 데이터 없음
    workers/, workers/[id]/     입소자 등록·관리, 실데이터
    alerts/, reports/           알림 이력 / 보고서, 실데이터
    settings/                   알림 설정 (저장은 안 됨, 데모)
  login, signup, record, result, records, settings, about, faq
                              원래 있던 소비자용 크라우드소싱 앱 페이지, 그대로 유지 중
  privacy/                    개인정보처리방침 (Play 스토어 등록용, 로그인 불필요)
  api/hub/                    입소자 등록·체크인·실시간 연동용 Route Handler
  api/admin/                  관리자 로그인/로그아웃
  api/*                       나머지는 전부 FastAPI 대리 호출용
components/
  hub/                        대시보드 쪽 전용 컴포넌트
  dashboard/                  dashboard-demo 전용 더미 데이터 시연 컴포넌트
  checkin/                    입소자 체크인 녹음기, CoughRecorder 단순화 버전
  record/, signup/, settings/ 기존 소비자 앱 컴포넌트
lib/
  anima-api.ts                 FastAPI 호출 + 쿠키 처리
  hub-roster.ts                 입소자 명단·체크인 기록 저장 (파일 기반, 5번 참고)
  hub-mock.ts                   랜딩 페이지 예시 화면용 가짜 데이터
  dashboard-demo.ts             dashboard-demo 화면용 더미 데이터
  result.ts                     판정 기준, 화면 표시용 계산
proxy.ts                      미들웨어 — 방문자 UUID 쿠키 발급 + 대시보드 비밀번호 검사
data/                        hub-roster.ts가 쓰는 JSON (.gitignore 처리, 커밋 안 됨)
```

---

## 3. 서버 연동

자체 DB는 없고, 오디오 분석은 FastAPI 서버가 전부 담당합니다. 브라우저가 FastAPI를
직접 못 부르는 이유는 CORS 때문이고, 그래서 `app/api/*` Route Handler가 중간에서
대신 호출합니다(`lib/anima-api.ts`의 `callAnimaApi()`).

```
브라우저 → Next.js 서버(app/api/*) → FastAPI 서버
```

주소는 `lib/anima-api.ts`:
```ts
export const ANIMA_API_BASE_URL =
  process.env.ANIMA_API_BASE_URL ?? "https://api.animawith.cloud";
```

2026-10월에 분석 서버랑 웹 서버를 같은 개인 서버로 옮겼습니다. 분석은
`api.animawith.cloud`, 사이트 자체는 `animawith.cloud`로 서브도메인만 나눴고 둘 다
https라 전에 있던 mixed content 문제는 없어졌습니다. 예전 주소들은 이제 안 씁니다.

일반 방문자는 계정 없이 UUID 쿠키(`anima_uid`)로만 식별합니다. 처음 오면 `proxy.ts`가
자동 발급합니다.

대시보드는 따로 아이디+비밀번호로 막아뒀습니다. `/admin/login`에서 맞히면
`ADMIN_AUTH_COOKIE`가 심어지고, 그게 있어야 `/dashboard/*`랑 관리자용 API
(`/api/hub/workers`, `/api/hub/sync`, `/api/hub/alerts`)에 들어갈 수 있습니다. FastAPI
계정 시스템(`/login`, `/signup`)과는 완전히 별개이고, 팀이 같이 쓰는 아이디·비밀번호
하나입니다. 반대로 `/api/hub/checkin`처럼 입소자 본인이 `/checkin`에서 쓰는 주소는
이거랑 상관없이 그대로 열려 있어야 해서 안 막았습니다. 로그인 없이도 더미
데이터로 동작 방식만 보는 `/dashboard-demo`는 이 검사 대상이 아니라 늘 공개입니다.

아이디·비밀번호 자체는 코드에 안 넣고 `ANIMA_ADMIN_ID`/`ANIMA_ADMIN_PASSWORD`
환경변수로만 관리합니다(`proxy.ts`의 `getAdminId()`/`getAdminPassword()`). 배포
서버에 이 환경변수 꼭 설정해 주세요, 안 하면 로컬 개발용 기본값(`admin`/`12345678`)이
그대로 살아있어서 뚫립니다.

---

## 4. 모바일

일반 소비자 페이지는 다 반응형으로 돼 있습니다. 대시보드는 표·실시간 목록이 많아서
PC 기준으로 짰고, 1024px보다 좁은 화면에서는 `components/hub/AppShell.tsx`가
"PC에서 이용해 주세요" 안내만 보여주고 실제 화면은 아예 안 그립니다(불필요한
폴링 요청도 안 나가게).

---

## 5. 체크인 / 실시간 연동 — 데이터는 어떻게 쌓이나

하드웨어를 안 만들기로 하면서, 입소자를 식별하고 체크인 기록을 쌓아둘 곳이 새로
필요해졌습니다. FastAPI DB엔 "시설/입소자/오전오후" 개념이 없어서(기기 UUID로만
식별하는 모델) 그 매핑만 이 저장소가 따로 들고 있습니다.

입소자 본인 체크인 흐름:
```
/checkin에서 이름 등록 → 기침 녹음 → app/api/hub/checkin
  → FastAPI POST /upload (기존 /api/record랑 똑같은 호출)
  → 결과(이탈도 %, 양호/주의/경고)를 lib/hub-roster.ts에 저장
  → app/dashboard/*가 읽어서 보여줌
```

실시간 연동 흐름(앱 UUID 등록 방식)은 조금 다릅니다. 관리자가 `/dashboard`나
`/dashboard/workers`에서 이름 + 앱에서 복사한 UUID로 등록해두면, `/api/hub/sync`가
몇 초마다 FastAPI의 `/records` 기록을 조회해서 새로 생긴 것만 가져옵니다. 앱 쪽
코드를 안 건드리고 기존 FastAPI 조회 API만으로 실시간처럼 보이게 만든 거라, 별도
서버(WebSocket 같은 거)가 필요 없습니다.

분석 자체는 두 흐름 다 100% 진짜입니다. `/api/record`가 쓰는 것과 똑같이 FastAPI
`POST /upload`를 부르고, 응답의 `distance`를 `lib/result.ts`의
`classifyRisk`/`toDisplayPercent`로 바꿔서 보여줍니다.

현재 한계: `lib/hub-roster.ts`는 `data/hub-roster.json` 파일을 직접 읽고 씁니다.
로컬이나 지금 쓰는 서버(Node 프로세스가 계속 떠 있음)에서는 문제없지만, Vercel 같은
서버리스에 올리면 요청마다 파일시스템이 초기화돼서 기록이 안 남습니다. 정식
서비스 전에는 DB로 옮겨야 합니다(FastAPI 쪽에 테이블 추가하거나 별도 DB). 지금은
"서버 연동 자체는 진짜 되는지" 보여주려고 임시로 쓰는 구조입니다.

관리자 로그인 후 보는 대시보드 전체(전체현황/입소자 관리/알림 이력/보고서)가
예시 데이터 없이 `lib/hub-roster.ts`에 실제로 저장된 데이터만 보여줍니다(데모버전인
`/dashboard-demo`만 예외). 2026-10월부터 팀원들이
직접 앱을 설치해 녹음하면서 이 데이터를 채우고 있습니다.

---

## 6. 배포

`npm ci` → `npm run build` → `npm run start` 순서를 꼭 지켜야 합니다. 소스만 올리고
빌드를 안 하면 `.next/static`이 없어서 전부 404가 납니다. nginx 같은 리버스
프록시를 쓴다면 모든 경로를 Next 서버(3000번 포트)로 넘겨야 하고, `/_next/static/...`
만 따로 처리하려고 하면 이것도 404가 납니다. 서브 경로 뒤에 앱을 물릴 거면
`next.config.ts`에 `basePath` 추가해야 하는데 지금은 루트 도메인 기준이라 설정
안 해뒀습니다.

지금 FastAPI랑 같은 개인 서버에 Next.js까지 같이 올리고 있어서, 서버 프로세스
하나 죽으면 사이트 전체가 같이 먹통이 되는 구조입니다. 나중에 여유 생기면
프론트만 Vercel로 분리하는 걸 권장합니다(서버리스라 프로세스 죽을 일이 없고,
깃허브 연결하면 push마다 자동 배포됨). 단, 4번에서 말한 파일 기반 저장소를 DB로
옮기는 게 먼저입니다 — 안 그러면 입소자 관리/실시간 연동 쪽이 Vercel에서 그대로
깨집니다.

---

## 7. 그 밖에

- 판정 기준(양호/주의/경고)은 `lib/result.ts`에 있고, 개인 기준선이 아니라 COUGHVID
  기반 healthy 분포(`p50=5.5149`, `p75=6.6988`)를 씁니다. 화면에는 원거리 값 대신
  0~100% 환산값만 보여줍니다.
- 랜딩 페이지 기능 쇼케이스랑 `/dashboard-demo`만 예시 데이터고, 관리자 로그인 후
  보는 `/dashboard/*`는 전부 실데이터라는 거 다시 한번 — 헷갈리기 쉬운 부분이라 적어둠.
