import { isAdminAuthCookieValid } from "@/proxy";
import { readFacilitySettings, writeFacilitySettings } from "@/lib/facility-settings";

export async function GET() {
  return Response.json({ settings: readFacilitySettings() });
}

// 시설 정보 수정. 로그인 비밀번호가 맞아야만 바뀜(실수로 또는 남이 건드리는 것 방지)
export async function PATCH(request: Request) {
  let body: { siteName?: string; adminName?: string; email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청을 읽지 못했습니다." }, { status: 400 });
  }

  if (!isAdminAuthCookieValid(body.password)) {
    return Response.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const siteName = body.siteName?.trim();
  const adminName = body.adminName?.trim();
  const email = body.email?.trim();
  if (!siteName || !adminName || !email) {
    return Response.json({ error: "시설명·관리자 이름·이메일을 모두 입력해 주세요." }, { status: 400 });
  }

  const settings = writeFacilitySettings({ siteName, adminName, email });
  return Response.json({ settings });
}
