import { cookies } from "next/headers";
import {
  animaUrl,
  callAnimaApi,
  writeDisplayUserIdCookie,
  writeUserUuidCookie,
} from "@/lib/anima-api";
import { ADMIN_AUTH_COOKIE, getAdminId, getAdminPassword } from "@/proxy";

type LoginResponse = {
  ok: boolean;
  user_uuid: string;
  user_id: string;
};

const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

// 로그인 성공하면 이 브라우저 UUID를 그 계정 UUID로 바꿔치기. 다른 기기 기록 이어보기용
export async function POST(request: Request) {
  let body: { user_id?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 본문을 읽지 못했습니다." }, { status: 400 });
  }

  const result = await callAnimaApi<LoginResponse>(animaUrl("/account/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  await writeUserUuidCookie(result.data.user_uuid);
  await writeDisplayUserIdCookie(result.data.user_id);

  // 입력한 아이디·비밀번호가 대시보드 관리자 계정과 같으면, 일반 로그인과 동시에
  // 관리자 로그인도 같이 처리함(따로 /admin/login에 또 들어갈 필요 없게)
  if (body.user_id === getAdminId() && body.password === getAdminPassword()) {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_AUTH_COOKIE, getAdminPassword(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      secure: process.env.NODE_ENV === "production",
    });
  }

  return Response.json(result.data);
}
