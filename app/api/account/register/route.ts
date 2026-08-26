import {
  animaUrl,
  callAnimaApi,
  readUserUuid,
  writeDisplayUserIdCookie,
  writeUserUuidCookie,
} from "@/lib/anima-api";

type RegisterResponse = {
  ok: boolean;
  user_uuid: string;
  user_id: string;
};

/**
 * 지금 이 브라우저의 게스트 UUID에 아이디·비밀번호를 붙여 계정으로 승격합니다.
 * 이후 다른 기기에서 로그인하면 이 UUID로 지금까지의 기록을 이어볼 수 있습니다.
 */
export async function POST(request: Request) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json(
      { error: "방문자 정보가 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요." },
      { status: 400 },
    );
  }

  let body: { user_id?: string; password?: string; recovery_email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 본문을 읽지 못했습니다." }, { status: 400 });
  }

  const result = await callAnimaApi<RegisterResponse>(
    animaUrl("/account/register"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, user_uuid: userUuid }),
    },
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  await writeUserUuidCookie(result.data.user_uuid);
  await writeDisplayUserIdCookie(result.data.user_id);
  return Response.json(result.data);
}
