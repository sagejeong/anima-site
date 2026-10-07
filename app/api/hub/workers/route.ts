import { addWorkerPlaceholder, addWorkerWithUuid, latestCheckinForWorker, listWorkers } from "@/lib/hub-roster";

// 대시보드 입소자 목록, 실제 등록된 명단 + 각자 최근 체크인
export async function GET() {
  const workers = listWorkers().map((worker) => ({
    ...worker,
    latest: latestCheckinForWorker(worker.id),
  }));
  return Response.json({ workers });
}

// 관리자가 미리 이름만 등록(아직 체크인 안 한 상태) 또는 앱 UUID를 바로 붙여서 등록
export async function POST(request: Request) {
  let body: { name?: string; team?: string; userUuid?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청을 읽지 못했습니다." }, { status: 400 });
  }

  const name = body.name?.trim();
  const team = body.team?.trim();
  const userUuid = body.userUuid?.trim();
  if (!name || !team) {
    return Response.json({ error: "이름과 소속 팀을 입력해 주세요." }, { status: 400 });
  }

  const worker = userUuid ? addWorkerWithUuid({ name, team, userUuid }) : addWorkerPlaceholder({ name, team });
  return Response.json({ worker });
}
