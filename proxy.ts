import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 방문자마다 user_uuid를 하나 발급해 쿠키에 심습니다.
 *
 * localStorage가 아니라 서버가 심는 쿠키를 쓰는 이유:
 * iOS 사파리는 스크립트가 저장한 값을 7일 미방문 시 지워버립니다.
 * 서버가 내려준 쿠키는 그 규칙을 덜 타서 기록이 더 오래 이어집니다.
 *
 * httpOnly라서 브라우저 스크립트는 이 값을 읽지 못합니다.
 * 서버로 보낼 때 우리 쪽 API가 대신 붙여줍니다.
 */

export const USER_UUID_COOKIE = "anima_uid";

/** 대시보드 공용 비밀번호 확인용 쿠키. 값이 실제 비밀번호와 같을 때만 통과시킴 */
export const ADMIN_AUTH_COOKIE = "anima_admin_auth";

/** 팀 전체가 같이 쓰는 대시보드 비밀번호. 실서비스 전엔 ANIMA_ADMIN_PASSWORD 환경변수로 바꿔야 함 */
export function getAdminPassword(): string {
  return process.env.ANIMA_ADMIN_PASSWORD ?? "anima2026";
}

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * 관리자 전용 데이터 API. 화면(/dashboard/*)만 비밀번호로 막고 이 주소들을
 * 빼먹으면, 비밀번호 없이 이 주소로 직접 요청해서 실명·UUID·건강 상태를
 * 그대로 읽거나(GET) 명단을 지울 수(DELETE) 있어서 화면 잠금이 무의미해짐.
 * /api/hub/checkin, /api/hub/register-worker, /api/hub/whoami는 입소자 본인이
 * /checkin에서 쓰는 주소라 여기 포함하지 않음(관리자 비밀번호를 몰라도 돼야 함).
 */
const ADMIN_API_PREFIXES = ["/api/hub/workers", "/api/hub/sync", "/api/hub/alerts"];

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
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isAdminApi = ADMIN_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isDashboardPage || isAdminApi) {
    const authed = request.cookies.get(ADMIN_AUTH_COOKIE)?.value === getAdminPassword();
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
  // 정적 파일에는 실행할 필요가 없습니다.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
  ],
};
