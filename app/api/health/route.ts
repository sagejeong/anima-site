import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";

// 중계가 제대로 동작하는지 확인하는 용도. 읽기 전용이라 마음 놓고 호출해도 됨
export async function GET() {
  const userUuid = await readUserUuid();
  const result = await callAnimaApi<{ ok: boolean }>(animaUrl("/health"));

  return Response.json(
    {
      relay: "ok",
      userUuidIssued: userUuid !== null,
      server: result.ok ? result.data : null,
      error: result.ok ? null : result.error,
    },
    { status: result.ok ? 200 : result.status },
  );
}
