import { clearAuthCookies } from "@/lib/anima-api";

/** 이 브라우저를 계정에서 분리하고, 이름 없는 방문자 상태로 되돌립니다. */
export async function POST() {
  await clearAuthCookies();
  return Response.json({ ok: true });
}
