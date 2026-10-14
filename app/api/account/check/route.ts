import type { NextRequest } from "next/server";
import { animaUrl, callAnimaApi } from "@/lib/anima-api";

type CheckResponse = {
  ok: boolean;
  available: boolean;
};

// 회원가입 아이디 중복 확인
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return Response.json({ error: "아이디를 입력해 주세요." }, { status: 400 });
  }

  const result = await callAnimaApi<CheckResponse>(
    animaUrl("/account/check", { user_id: userId }),
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(result.data);
}
