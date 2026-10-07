import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE, getAdminPassword } from "@/proxy";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

// 대시보드 공용 비밀번호 확인. 맞으면 쿠키를 심어서 proxy.ts가 통과시키게 함
export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청을 읽지 못했습니다." }, { status: 400 });
  }

  const expected = getAdminPassword();
  if (body.password !== expected) {
    return Response.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_IN_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  return Response.json({ ok: true });
}
