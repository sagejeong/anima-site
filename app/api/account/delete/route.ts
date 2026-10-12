import {
  animaUrl,
  callAnimaApi,
  clearAuthCookies,
  readUserUuid,
} from "@/lib/anima-api";

// 계정+기록 삭제. 2026-08-16 기준 /openapi.json 보면 서버에 /upload, /records/sync,
// /records, /profile, /account/register, /account/login, /health밖에 없어서
// 삭제 엔드포인트 자체가 없음. 강민 님한테 따로 만들어달라고 해야 함
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
