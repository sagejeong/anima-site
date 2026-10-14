import { removeWorker, updateWorker } from "@/lib/hub-roster";

// 상세보기에서 이름·소속·앱 UUID 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: { name?: string; team?: string; userUuid?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청을 읽지 못했습니다." }, { status: 400 });
  }

  const name = body.name?.trim();
  const team = body.team?.trim();
  const userUuid = body.userUuid?.trim();
  if (name === "" || team === "") {
    return Response.json({ error: "이름과 소속은 비워둘 수 없습니다." }, { status: 400 });
  }

  const worker = updateWorker(id, {
    name,
    team,
    userUuid: userUuid === "" ? null : userUuid,
  });
  if (!worker) {
    return Response.json({ error: "해당 입소자를 찾지 못했습니다." }, { status: 404 });
  }
  return Response.json({ worker });
}

// 입소자 한 명 삭제. 체크인 기록도 같이 지워짐
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const removed = removeWorker(id);
  if (!removed) {
    return Response.json({ error: "해당 입소자를 찾지 못했습니다." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
