import {
  animaUrl,
  callAnimaApi,
  clearAuthCookies,
  readUserUuid,
} from "@/lib/anima-api";

/**
 * 계정과 지금까지의 기록을 함께 삭제합니다.
 *
 * TODO: 서버에 계정 삭제 엔드포인트가 아직 없습니다 (2026-08-16 기준
 * /openapi.json에는 /upload, /records/sync, /records, /profile,
 * /account/register, /account/login, /health 뿐). 강민 님께 계정+기록
 * 삭제용 엔드포인트를 요청해야 합니다. 그 전까지 이 호출은 실패하며,
 * 화면에는 "아직 준비되지 않은 기능"이라는 안내만 뜹니다.
 * 서버에 엔드포인트가 생기면 경로만 맞춰주면 그대로 동작합니다.
 */
export async function POST() {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json({ error: "방문자 정보가 없습니다." }, { status: 400 });
  }

  const result = await callAnimaApi<{ ok: boolean }>(
    animaUrl("/account/delete"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_uuid: userUuid }),
    },
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  await clearAuthCookies();
  return Response.json({ ok: true });
}
