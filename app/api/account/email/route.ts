import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";

// 복구용 이메일 변경.
// TODO(2026-08-16 기준 /openapi.json에 없음): 서버에 이메일 변경 엔드포인트 아직 없음,
// 강민 님한테 요청해서 경로 받으면 /account/email만 바꿔주면 됨. 그 전까진 항상 실패 →
// 화면엔 "아직 준비되지 않은 기능" 안내만
export async function POST(request: Request) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json({ error: "방문자 정보가 없습니다." }, { status: 400 });
  }

  let body: { recovery_email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 본문을 읽지 못했습니다." }, { status: 400 });
  }

  const result = await callAnimaApi<{ ok: boolean }>(animaUrl("/account/email"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, user_uuid: userUuid }),
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(result.data);
}
