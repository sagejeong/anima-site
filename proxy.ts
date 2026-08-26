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

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

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

  return response;
}

export const config = {
  // 정적 파일에는 실행할 필요가 없습니다.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)$).*)",
  ],
};
