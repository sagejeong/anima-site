import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";

/**
 * 참여 정보(나이·성별·생활환경 등)를 ANiMA 서버의 POST /profile 로 중계합니다.
 * user_uuid는 브라우저가 아니라 쿠키에서 읽어 서버가 직접 붙입니다.
 */
export async function POST(request: Request) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json(
      { error: "방문자 정보가 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요." },
      { status: 400 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 본문을 읽지 못했습니다." }, { status: 400 });
  }

  const result = await callAnimaApi<unknown>(animaUrl("/profile"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, user_uuid: userUuid }),
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(result.data);
}
