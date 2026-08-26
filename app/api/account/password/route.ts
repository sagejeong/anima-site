import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";

/**
 * 비밀번호를 바꿉니다.
 *
 * TODO: 서버에 비밀번호 변경 엔드포인트가 아직 없습니다 (2026-08-16 기준
 * /openapi.json 미포함). 강민 님께 요청 후 경로가 정해지면 아래 "/account/password"만
 * 맞는 경로로 바꿔주면 됩니다. 그 전까지는 항상 실패하고, 화면에는
 * "아직 준비되지 않은 기능"이라는 안내만 뜹니다.
 */
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
