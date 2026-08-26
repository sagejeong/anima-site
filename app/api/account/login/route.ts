import {
  animaUrl,
  callAnimaApi,
  writeDisplayUserIdCookie,
  writeUserUuidCookie,
} from "@/lib/anima-api";

type LoginResponse = {
  ok: boolean;
  user_uuid: string;
  user_id: string;
};

/**
 * 아이디·비밀번호로 로그인하면, 이 브라우저의 UUID를
 * 그 계정이 원래 쓰던 UUID로 바꿔치기합니다.
 * 그래야 다른 기기·브라우저에서도 지금까지의 기록을 이어볼 수 있습니다.
 */
export async function POST(request: Request) {
  let body: { user_id?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 본문을 읽지 못했습니다." }, { status: 400 });
  }

  const result = await callAnimaApi<LoginResponse>(animaUrl("/account/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  await writeUserUuidCookie(result.data.user_uuid);
  await writeDisplayUserIdCookie(result.data.user_id);
  return Response.json(result.data);
}
