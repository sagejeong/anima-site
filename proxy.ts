import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 방문자마다 user_uuid 하나씩 쿠키로 발급. localStorage 안 쓰는 이유는
// iOS 사파리가 7일 미방문 시 스크립트 저장값을 지워버리는데 서버 쿠키는 덜 그럼.
// httpOnly라 JS에선 못 읽고, 서버로 보낼 땐 API가 대신 붙여줌

export const USER_UUID_COOKIE = "anima_uid";

/** 대시보드 공용 비밀번호 확인용 쿠키. 값이 실제 비밀번호와 같을 때만 통과시킴 */
export const ADMIN_AUTH_COOKIE = "anima_admin_auth";

/**
 * 대시보드 로그인 아이디/비밀번호. 기본값을 코드에 두지 않음. 레포가 public이라
 * 기본값을 박아두면 그게 곧 운영 비밀번호 유출이 됨. 로컬 개발은 .env.local에
 * 직접 값을 넣어서 씀(README 참고)
 */
export function getAdminId(): string | undefined {
  return process.env.ANIMA_ADMIN_ID;
}

export function getAdminPassword(): string | undefined {
  return process.env.ANIMA_ADMIN_PASSWORD;
}

/**
 * 쿠키 값이 지금의 관리자 비밀번호와 일치하는지 확인. 환경변수가 비어 있으면
 * (둘 다 undefined인 경우 등) 쿠키도 없는 상태와 구분이 안 돼서 무조건 통과되는
 * 사고가 날 수 있어, 환경변수가 설정 안 됐으면 무조건 거짓으로 처리
 */
export function isAdminAuthCookieValid(cookieValue: string | undefined): boolean {
  const expected = getAdminPassword();
  return Boolean(expected) && cookieValue === expected;
}

/** 로그인 폼에서 받은 아이디·비밀번호가 실제 관리자 계정과 일치하는지. 위와 같은 이유로 환경변수 미설정 시 무조건 거짓 */
export function isAdminCredentials(id: string | undefined, password: string | undefined): boolean {
  const expectedId = getAdminId();
  const expectedPassword = getAdminPassword();
  return Boolean(expectedId && expectedPassword) && id === expectedId && password === expectedPassword;
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// 관리자 전용 데이터 API. 화면(/dashboard/*)만 막고 이거 빼먹으면 비밀번호 없이
// 직접 요청해서 실명, UUID, 건강 상태 다 읽히는 거 한 번 겪어서 따로 뺌.
// checkin/register-worker/whoami는 입소자 본인이 쓰는 주소라 여기 안 넣음
const ADMIN_API_PREFIXES = ["/api/hub/workers", "/api/hub/sync", "/api/hub/alerts", "/api/hub/settings"];

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.has(USER_UUID_COOKIE)) {
    response.cookies.set(USER_UUID_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_YEAR_IN_SECONDS,
      secure: process.env.NODE_ENV === "production",
    });
  }

  const pathname = request.nextUrl.pathname;
  const isDashboardPage = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAdminApi = ADMIN_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isDashboardPage || isAdminApi) {
    const authed = isAdminAuthCookieValid(request.cookies.get(ADMIN_AUTH_COOKIE)?.value);
    if (!authed && isDashboardPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!authed && isAdminApi) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  // 정적 파일에는 실행할 필요가 없음.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
  ],
};
