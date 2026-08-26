import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";

/**
 * 중계가 제대로 동작하는지 확인하는 용도입니다.
 * ANiMA 서버의 /health를 대신 불러 결과를 그대로 돌려줍니다.
 * 데이터를 쓰지 않는 읽기 전용 호출이라 마음 놓고 눌러도 됩니다.
 */
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
