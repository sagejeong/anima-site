# ANiMA 웹 프로젝트 문서

독거노인·1인 가구가 스스로 기침을 체크하고, 요양시설에서는 입소자가 **본인 폰**으로
오전/오후에 기침을 체크인해서 그 실제 분석 결과를 관리자가 한 화면에서 확인하는 웹
서비스입니다. (하드웨어 기기는 개발하지 않기로 확정됨, 2026-09-15 방향 전환)

이 문서는 팀원 전체가 스택, 서버 연동, 배포 방식을 같은 기준으로 이해할 수 있도록
정리한 것입니다.

> **현재 상태**: 입소자 체크인(`/checkin`) → 실제 FastAPI 분석 → 대시보드(`/dashboard`)
> 표시까지 실제로 동작합니다. 다만 입소자 명단·체크인 기록을 담는 저장소가 아직 파일
> 기반 임시 저장소(`lib/hub-roster.ts`)라 정식 서비스 전엔 진짜 DB로 옮겨야 합니다.
> 아래 "체크인 파이프라인" 항목 참고. 대시보드 개요/알림/보고서/입소자 관리 화면에는
> 발표·시연용 예시 데이터(`lib/dashboard-demo.ts`)가 같이 표시되며, 화면에 "예시 데이터"
> 배지로 항상 구분해둡니다. `/admin/login`, `/admin/signup`은 여전히 실제 인증 없이 데모입니다.

---

## 1. 기술 스택 (정확한 버전)

| 영역 | 기술 | 버전 |
|---|---|---|
| 프레임워크 | [Next.js](https://nextjs.org) | **16.3.0** (App Router, Turbopack) |
| UI 라이브러리 | React / React DOM | **19.2.8** |
| 언어 | TypeScript | `^5` |
| 스타일링 | Tailwind CSS | `^4` (`@tailwindcss/postcss`) |
| 린트 | ESLint / eslint-config-next | `^9` / `16.3.0` |
| 실행 환경 | **Node.js** | **20.9.0 이상 필수** (Next.js 16이 `package.json`의 `engines.node`에 명시) |
| 패키지 매니저 | npm | 로컬 개발은 npm 11.x 기준 (yarn/pnpm 써도 무방하나 lock 파일 하나만 유지) |

**Node 버전 확인**
```bash
node -v   # v20.9.0 이상이어야 함 (v22, v24 등 최신 LTS도 문제없음)
```

### 폰트

| 용도 | 서체 | 로드 방식 |
|---|---|---|
| 기존 소비자 앱 본문 | Geist / Geist Mono | `next/font/google` |
| 기존 소비자 앱 제목(h1~h3) | 나눔명조 Bold | `next/font/local`, `app/fonts/NanumMyeongjo-Bold-subset.woff2` (3MB 원본을 `scripts/subset-fonts.py`로 서브셋한 것) |
| ANiMA 사이트 제목 | Calistoga (한글은 Gothic A1로 대체) | `next/font/google` |
| ANiMA 사이트 본문·라벨 | Inter (한글은 Noto Sans KR로 대체) | `next/font/google` |

Calistoga/Inter는 한글 글자가 없어서, 같은 톤의 한글 서체를 폰트 스택 뒤에 이어붙였습니다
(`--font-hub-display`, `--font-hub-body`, `app/globals.css` 참고).

### 스타일 시스템

Tailwind v4라 `tailwind.config.js` 파일이 없습니다. 색상·폰트·애니메이션 전부
`app/globals.css`의 `@theme { ... }` 블록에서 CSS 변수로 등록합니다. 화이트 톤 배경에
브랜드 주황(`--color-primary`)을 포인트로 쓰는 밝은 시스템이고, 순백 대신 살짝 톤
다운된 아이보리 배경을 씁니다. 색을 바꾸려면 이 파일(`--color-steel`, `--color-good`,
`--gradient-brand` 등)만 고치면 되고, 컴포넌트 코드는 전부 이 토큰만 참조하므로 여기서
값만 바꿔도 사이트 전체가 같이 바뀝니다.

### 로고

- `public/anima_logo.png`: 일반 소비자 사이트(홈, 기록, 설정 등)에서 씀
- `public/anima_hub_logo.png`: 대시보드 계열(사이드바, 관리자 로그인/회원가입, 체크인
  화면, 홈 화면 대시보드 미리보기 카드)에서 씀

둘 다 텍스트로 재현하거나 색을 임의로 바꾸지 않고 파일 그대로 사용합니다.

---

## 2. 로컬 개발 시작하기

```bash
npm install
npm run dev
```
`http://localhost:3000`에서 확인합니다.

```bash
npm run build   # 프로덕션 빌드 (Turbopack)
npm run start   # 빌드 결과 실행 (포트 3000, 환경변수 PORT로 변경 가능)
npm run lint     # ESLint
```

---

## 3. 프로젝트 구조

```
app/                     페이지 (App Router, 폴더 하나 = URL 경로 하나)
  page.tsx                 랜딩, 기침 녹음·분석과 대시보드 두 실제 기능으로 들어가는 허브
  checkin/                  입소자용 체크인 화면, 본인 폰으로 이름 등록 후 오전/오후 녹음
  admin/login, admin/signup  관리자 로그인·계정 생성 (현재 데모)
  dashboard/                대시보드 전체 (레이아웃에서 AppShell로 감쌈)
    page.tsx                  전체 현황, 예시 데이터로 채운 실시간 시연 화면
    workers/, workers/[id]/   입소자 등록 관리 (실제 등록 폼 + 예시 데이터 혼합)
    alerts/, reports/         알림 이력 / 보고서 (예시 데이터)
    settings/                 알림 설정 (데모, 저장 안 됨)
  login, signup, record, result, records, settings, about, faq
                            기존 소비자용 크라우드소싱 앱 페이지 (당분간 유지, 신규 방향과 무관)
  api/hub/                 입소자 등록·체크인용 Route Handler (whoami, register-worker, workers, checkin)
  api/*                    그 외 Next.js Route Handler, 브라우저 대신 FastAPI를 대리 호출
components/
  hub/                     대시보드·체크인 전용 컴포넌트 (AppShell, StatusPill, LineChart 등)
  dashboard/                대시보드 예시 데이터 실시간 시연 컴포넌트 (LiveDashboard)
  checkin/                  입소자 체크인 녹음기(CheckinRecorder), CoughRecorder의 단순화 버전
  record/, signup/, settings/  기존 소비자 앱 컴포넌트
lib/
  anima-api.ts              FastAPI 호출 유틸 + 쿠키 읽기/쓰기
  hub-roster.ts              입소자 명단 + 체크인 기록 저장소 (파일 기반 임시 DB, 아래 참고)
  hub-mock.ts                랜딩 페이지 "예시 화면"에만 쓰는 가짜 샘플 데이터
  dashboard-demo.ts          대시보드 개요/알림/보고서 화면에서 쓰는 발표·시연용 예시 데이터
  result.ts                  판정 기준(양호/주의/경고), 화면 표시용 계산
proxy.ts                   Next.js 미들웨어, 방문자 UUID 쿠키 발급
public/anima_logo.png      일반 소비자 사이트 로고
public/anima_hub_logo.png  대시보드 계열 로고
data/                     hub-roster.ts가 쓰는 JSON 파일 저장소 (.gitignore 처리됨, 커밋 안 됨)
```

---

## 4. 서버(백엔드) 연동 방식

**이 저장소는 자체 DB가 없습니다.** 오디오 분석은 FastAPI 서버가 담당하고, Next.js는
그 서버를 대신 호출해주는 창구 역할만 합니다.

### 왜 브라우저가 FastAPI를 직접 안 부르는가

브라우저에서 직접 부르면 FastAPI 쪽에 CORS 허용 설정이 필요합니다. 그래서 `app/api/*`
(Next.js **Route Handler**, 서버에서 실행됨)가 중간에서 FastAPI를 대신 호출합니다. 이 구조는
`lib/anima-api.ts`의 `callAnimaApi()`가 담당합니다.

```
브라우저 → Next.js 서버 (app/api/*) → FastAPI 서버
```

### 접속 주소 설정

```ts
// lib/anima-api.ts
export const ANIMA_API_BASE_URL =
  process.env.ANIMA_API_BASE_URL ?? "https://api.animawith.cloud";
```

- 2026-10월부터 분석 서버와 웹 서버 둘 다 같은 개인 서버로 옮겨졌습니다. 분석 서버는
  `https://api.animawith.cloud`, 웹 사이트 자체는 `https://animawith.cloud`로 분리된
  서브도메인을 씁니다. 둘 다 https라 예전에 있던 mixed content 문제(사이트는 https인데
  FastAPI가 http라 브라우저가 막던 문제)는 더 이상 없습니다.
- 예전에 쓰던 `158.101.89.133:8000`(분석 서버), `161.33.138.96` / `anima-with.duckdns.org`
  (웹 서버) 주소는 더 이상 쓰지 않습니다.

### 로그인 상태 (기존 소비자 앱 기준)

계정 개념 없이 **기기/브라우저마다 UUID 쿠키(`anima_uid`)** 로 식별합니다. `proxy.ts`(미들웨어)가
방문자가 처음 오면 자동으로 발급합니다. 관리자 대시보드 쪽은 이 방식을 그대로 쓰지 않고, 별도
관리자 인증 체계를 새로 설계해야 합니다. 아직 미구현 상태입니다.

---

## 5. 체크인 파이프라인 (입소자 → 실제 분석 → 대시보드)

하드웨어를 안 만들기로 하면서, 입소자 식별·체크인 기록을 담을 곳이 새로 필요해졌습니다.
FastAPI 쪽 DB(`DB 설계 및 저장로직 V8`)엔 "시설/입소자/오전오후" 같은 개념이 아예 없어서
(기기 UUID로 식별하는 익명 방문자 모델만 있음), 그 매핑만 이 저장소가 따로 들고 있습니다.

```
입소자 폰(/checkin) → 이름 등록 → 기침 녹음
  → app/api/hub/checkin → FastAPI POST /upload (실제 분석, 기존 /api/record와 동일한 호출)
  → 실제 분석 결과(이탈도 %, 양호/주의/경고)를 lib/hub-roster.ts에 기록
  → app/dashboard/* 가 그 기록을 읽어서 화면에 표시
```

**분석 자체는 100% 진짜입니다.** 새로 지어낸 로직이 아니라 기존 `/api/record`가 쓰는 것과
똑같이 FastAPI `POST /upload`를 호출하고, 그 응답의 `distance`를 `lib/result.ts`의
`classifyRisk`/`toDisplayPercent`로 환산합니다.

**입소자 식별 방식**: FastAPI의 계정 시스템(`/account/register` 등)은 안 씁니다. 그냥
입소자의 폰이 `proxy.ts`가 이미 발급하는 익명 UUID 쿠키(`anima_uid`)를 그대로 쓰고,
`/checkin`에서 입력한 이름·병동을 그 UUID에 붙여서 `lib/hub-roster.ts`(파일 하나)에
저장합니다. 같은 폰으로 다시 접속하면 등록 화면을 건너뜁니다.

**중요한 한계, 반드시 읽어주세요**: `lib/hub-roster.ts`는 `data/hub-roster.json` 파일을
직접 읽고 씁니다. 로컬 개발이나 지금 쓰는 서버(Node 프로세스가 계속 떠 있는 방식)에서는 문제없이
동작하지만, **Vercel 같은 서버리스에 배포하면 요청마다 파일시스템이 초기화돼서 등록·체크인
기록이 저장되지 않습니다.** 정식 서비스 전에는 이 파일 저장소를 실제 DB(FastAPI에 입소자/체크인
테이블을 추가하거나, 별도 DB)로 옮겨야 합니다. 지금은 "서버 연동이 실제로 되는지" 빨리
확인하기 위한 임시 다리입니다.

**대시보드 예시 데이터**: `app/dashboard/page.tsx`, `alerts/`, `reports/`, `workers/`
화면에는 `lib/dashboard-demo.ts`의 발표·시연용 데이터가 같이 섞여 있습니다. 실제
`lib/hub-roster.ts` 체크인 기록과는 완전히 분리돼 있고, 화면에는 항상 "예시 데이터" 배지가
붙습니다. 등록 폼으로 직접 추가한 입소자는 실제로 저장되는 데이터입니다.

---

## 6. 배포할 때 반드시 확인할 것 (상대경로/절대경로 이슈)

**결론: 코드에 상대경로를 손으로 쓴 부분은 없습니다.** Next.js가 빌드할 때
`/_next/static/...` 같은 **루트 기준 절대경로**를 자동으로 만들어 넣기 때문에, 개발자가
경로를 직접 잘못 쓸 수 있는 구조 자체가 아닙니다.

문제는 항상 **서버가 빌드 결과물을 서빙하는 방식**에서 생깁니다. 배포할 때 아래를 순서대로
확인해 주세요.

1. **`npm ci`(또는 `npm install`) → `npm run build` → `npm run start` 순서를 그대로 지켰는지.**
   소스 코드만 올리고 빌드를 안 하면 `.next/static`(CSS·JS)이 아예 없어서 전부 404가 납니다.
2. **`.next` 폴더 전체가 배포 서버에 올라갔는지.** 일부만 복사하면 안 됩니다.
3. **nginx 등 리버스 프록시를 쓴다면, 모든 경로를 예외 없이 Next.js 서버(기본 3000번 포트)로
   넘기는지.** `/_next/static/...`, `/favicon.ico` 같은 정적 경로만 프록시가 따로 처리하려고
   하면 404가 납니다. 서브 경로(`/anima/` 등) 뒤에 이 앱을 물릴 계획이면 `next.config.ts`에
   `basePath` 설정이 추가로 필요합니다 (지금은 설정 안 되어 있음, 루트 도메인 기준입니다).
4. **재빌드 후 오래된 캐시(HTML)가 남아있지 않은지.** 빌드마다 CSS/JS 파일명 해시가 바뀌므로,
   캐시된 옛 HTML이 존재하지 않는 파일명을 가리키면 전부 404가 납니다. 시크릿창으로 재확인.

### 권장: Vercel 배포

지금 쓰는 서버(FastAPI랑 같은 개인 서버)에 Next.js까지 같이 올리면, 서버 프로세스가
죽었을 때 사이트 전체가 먹통이 되는 문제가 반복됩니다. Next.js를 만든 회사가 만든 호스팅인
[Vercel](https://vercel.com)에 프론트만 분리 배포하면 이 문제 자체가 사라집니다
(서버리스라 죽는 프로세스가 없음, GitHub 연결만 하면 push마다 자동 배포, https 자동 적용).
단, `lib/hub-roster.ts`의 파일 기반 저장소는 서버리스에서 안 돌아가므로, Vercel로 옮기기
전에 실제 DB 이전이 먼저 필요합니다. 배포 시 환경변수 `ANIMA_API_BASE_URL`만 등록하면 됩니다.

---

## 7. 알아두면 좋은 것

- **판정 기준(양호/주의/경고)**: `lib/result.ts`. 개인 기준선이 아니라 COUGHVID 기반 healthy
  분포(`p50=5.5149`, `p75=6.6988`)를 기준으로 삼습니다. 화면에는 원거리(raw distance) 대신
  0~100%로 환산한 값만 보여줍니다.
- **랜딩 페이지의 기능 쇼케이스, 대시보드 개요/알림/보고서 화면은 예시 데이터**입니다
  (`lib/hub-mock.ts`, `lib/dashboard-demo.ts`). 화면 생김새와 동작 방식을 보여주는 용도이고,
  화면에 "예시 데이터" 배지로 표시됩니다. 입소자 관리 화면의 등록 폼만 실제 저장소
  (`lib/hub-roster.ts`)에 연결돼 있습니다.
- **관리자 로그인/계정 생성은 아직 데모**입니다. 제출하면 실제 인증 없이 대시보드로 이동만
  합니다. 관리자 인증 체계는 아직 설계 전입니다.
