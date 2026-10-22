import { clearAllWorkers } from "@/lib/hub-roster";
import { isAdminAuthCookieValid } from "@/proxy";

// 전체 명단 비우기. 되돌릴 수 없는 작업이라 로그인 비밀번호를 한 번 더 확인함
export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청을 읽지 못했습니다." }, { status: 400 });
  }

  if (!isAdminAuthCookieValid(body.password)) {
    return Response.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const count = clearAllWorkers();
  return Response.json({ ok: true, count });
}
