# ANiMA 웹

기침 소리를 녹음하면 평소 기침과 얼마나 달라졌는지 보여주는 서비스. 요양시설에서는
입소자가 본인 폰으로 체크인하면 관리자가 대시보드에서 현황을 본다.

## 실행

```bash
node -v   # 20.9.0 이상
npm install
npm run dev     # localhost:3000
```

```bash
npm run build
npm run start
npm run lint
```

## 환경변수

- `ANIMA_API_BASE_URL` (없으면 `https://api.animawith.cloud` 사용)
- `ANIMA_ADMIN_ID`
- `ANIMA_ADMIN_PASSWORD`

로컬 개발은 `.env.local`에 값을 넣는다. `ANIMA_ADMIN_ID`/`ANIMA_ADMIN_PASSWORD`가
없으면 관리자 로그인 자체가 막힌다(기본값 없음).

## 폴더 구조

```
app/
  page.tsx                   랜딩
  checkin/                   입소자용 체크인 화면
  admin/login/                관리자 로그인
  dashboard-start/            대시보드 보기 선택 화면(데모 / 관리자 로그인)
  dashboard-demo/             로그인 불필요, 더미 데이터 데모
  dashboard/                  실제 대시보드, 관리자 로그인 필요
  login, signup, record, result, records, settings, about, faq
                              소비자용 크라우드소싱 앱 페이지
  privacy/                    개인정보처리방침
  api/hub/                    입소자 등록·체크인·실시간 연동 Route Handler
  api/admin/                  관리자 로그인/로그아웃
  api/*                       나머지는 FastAPI 대리 호출
components/
  hub/                        대시보드 전용 컴포넌트
  dashboard/                  dashboard-demo용 더미 데이터 컴포넌트
  checkin/                    입소자 체크인 녹음기
  record/, signup/, settings/ 소비자 앱 컴포넌트
lib/
  anima-api.ts                 FastAPI 호출 + 쿠키 처리
  hub-roster.ts                 입소자 명단·체크인 기록 저장 (파일 기반)
  result.ts                     판정 기준, 화면 표시용 계산
proxy.ts                      미들웨어. 방문자 UUID 쿠키 발급 + 대시보드 비밀번호 검사
data/                        hub-roster.ts가 쓰는 JSON (gitignore)
```

## 데이터 흐름

녹음은 앱과 웹 모두 같은 FastAPI 분석 서버로 올라가고, 분석 결과는 그 서버의 DB에
쌓인다. Next.js는 자체 DB가 없어서, 대시보드가 FastAPI의 기록 조회 API를 주기적으로
확인해 새로 생긴 결과만 화면에 반영한다. 브라우저는 FastAPI를 직접 부르지 못해서
(CORS), 모든 요청은 Next.js의 Route Handler(`app/api/*`)가 중계한다.

## 배포

```bash
git pull
npm ci
npm run build
# 이후 서비스 재시작
```

순서를 꼭 지켜야 한다. 빌드를 건너뛰면 정적 파일이 없어서 화면이 뜨지 않는다.
