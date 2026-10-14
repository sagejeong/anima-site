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

  // 관리자 자격은 FastAPI 계정이랑 무관하게 환경변수로만 판단함(proxy.ts).
  // 그 계정이 FastAPI 쪽에 없거나 지워졌어도 관리자 로그인은 그대로 돼야 함
  const isAdminCredentials =
    body.user_id === getAdminId() && body.password === getAdminPassword();

  const setAdminCookie = async () => {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_AUTH_COOKIE, getAdminPassword(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: THIRTY_DAYS_IN_SECONDS,
      secure: process.env.NODE_ENV === "production",
    });
  };

  const result = await callAnimaApi<LoginResponse>(animaUrl("/account/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    if (isAdminCredentials) {
      await setAdminCookie();
      return Response.json({ ok: true, user_id: getAdminId() });
    }
    return Response.json({ error: result.error }, { status: result.status });
  }

  await writeUserUuidCookie(result.data.user_uuid);
  await writeDisplayUserIdCookie(result.data.user_id);

  if (isAdminCredentials) {
    await setAdminCookie();
  }

  return Response.json(result.data);
}
