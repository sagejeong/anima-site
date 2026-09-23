import { readUserUuid } from "@/lib/anima-api";
import { registerWorkerForUuid } from "@/lib/hub-roster";

// 입소자가 /checkin에서 처음 이름을 입력하면, 지금 이 폰의 방문자 UUID에 이름을 붙임
export async function POST(request: Request) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json(
      { error: "방문자 정보가 없습니다. 새로고침 후 다시 시도해 주세요." },
      { status: 400 },
    );
  }

  let body: { name?: string; team?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청을 읽지 못했습니다." }, { status: 400 });
  }

  const name = body.name?.trim();
  const team = body.team?.trim();
  if (!name || !team) {
    return Response.json({ error: "이름과 소속 팀을 입력해 주세요." }, { status: 400 });
  }

  const worker = registerWorkerForUuid({ name, team, userUuid });
  return Response.json({ worker });
}
