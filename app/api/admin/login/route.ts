import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE, getAdminPassword, isAdminCredentials } from "@/proxy";

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

// 대시보드 관리자 로그인. 아이디+비밀번호가 맞으면 쿠키를 심어서 proxy.ts가 통과시키게 함
export async function POST(request: Request) {
  let body: { id?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청을 읽지 못했습니다." }, { status: 400 });
  }

  if (!isAdminCredentials(body.id, body.password)) {
    return Response.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_AUTH_COOKIE, getAdminPassword() as string, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_IN_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  return Response.json({ ok: true });
}
