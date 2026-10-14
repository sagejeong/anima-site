import { cookies } from "next/headers";
import { clearAuthCookies } from "@/lib/anima-api";
import { ADMIN_AUTH_COOKIE } from "@/proxy";

/**
 * 이 브라우저를 계정에서 분리하고 이름 없는 방문자 상태로 되돌림.
 * 로그인 때 아이디와 비밀번호가 관리자 계정과 같으면 관리자 로그인도 같이 되는 것과
 * 대칭으로, 로그아웃도 관리자 세션까지 같이 끝냄. 로그아웃 버튼이 두 개로 보이면 안 되니까
 */
export async function POST() {
  await clearAuthCookies();
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE);
  return Response.json({ ok: true });
}
