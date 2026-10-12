import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";

// 비밀번호 변경. email/route.ts랑 같은 사정 — 서버에 엔드포인트가 아직 없어서
// (2026-08-16 기준) 지금은 무조건 실패함. 생기면 /account/password 경로만 맞추면 됨
export async function POST(request: Request) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json({ error: "방문자 정보가 없습니다." }, { status: 400 });
  }

  let body: { current_password?: string; new_password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 본문을 읽지 못했습니다." }, { status: 400 });
  }

  const result = await callAnimaApi<{ ok: boolean }>(
    animaUrl("/account/password"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, user_uuid: userUuid }),
    },
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(result.data);
}
