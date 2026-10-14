import {
  animaUrl,
  callAnimaApi,
  clearAuthCookies,
  readUserUuid,
} from "@/lib/anima-api";

// 계정+기록 삭제. 서버가 본인 확인용으로 현재 비밀번호도 같이 받음
export async function POST(request: Request) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json({ error: "방문자 정보가 없습니다." }, { status: 400 });
  }

  let body: { current_password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 본문을 읽지 못했습니다." }, { status: 400 });
  }

  const result = await callAnimaApi<{ ok: boolean }>(
    animaUrl("/account/delete"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, user_uuid: userUuid }),
    },
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  await clearAuthCookies();
  return Response.json({ ok: true });
}
