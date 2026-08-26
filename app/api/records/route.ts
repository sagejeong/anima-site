import type { NextRequest } from "next/server";
import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";

/**
 * 이 방문자의 측정 기록 목록을 가져옵니다.
 * ANiMA 서버의 GET /records 를 중계하며, user_uuid는 쿠키에서 읽어 붙입니다.
 */
export async function GET(request: NextRequest) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json({ error: "방문자 정보가 없습니다." }, { status: 400 });
  }

  const updatedAfter = request.nextUrl.searchParams.get("updated_after");

  const result = await callAnimaApi<unknown>(
    animaUrl("/records", {
      user_uuid: userUuid,
      ...(updatedAfter ? { updated_after: updatedAfter } : {}),
    }),
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(result.data);
}
