import {
  animaUrl,
  callAnimaApi,
  readUserUuid,
  writeDisplayUserIdCookie,
  writeUserUuidCookie,
} from "@/lib/anima-api";
import { USER_ID_PATTERN, isReservedUserId, isValidSignupPassword } from "@/lib/signup";

type RegisterResponse = {
  ok: boolean;
  user_uuid: string;
  user_id: string;
};

// 지금 브라우저의 게스트 UUID에 아이디와 비밀번호를 붙여서 계정으로 승격
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

  // 폼 쪽 검증(lib/signup.ts)이랑 똑같은 규칙을 여기서도 확인. API를 직접 호출해서
  // 우회하는 경우까지 막아야 해서 중복 검사
  const userId = body.user_id ?? "";
  if (!USER_ID_PATTERN.test(userId)) {
    return Response.json(
      { error: "아이디는 영문 4~20자여야 합니다." },
      { status: 400 },
    );
  }
  if (isReservedUserId(userId)) {
    return Response.json({ error: "사용할 수 없는 아이디입니다." }, { status: 400 });
  }
  if (!isValidSignupPassword(body.password ?? "")) {
    return Response.json(
      { error: "비밀번호는 숫자, 영문, 특수문자를 포함해 8자 이상이어야 합니다." },
      { status: 400 },
    );
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
