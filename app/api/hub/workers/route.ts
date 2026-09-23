import { addWorkerPlaceholder, latestCheckinForWorker, listWorkers } from "@/lib/hub-roster";

// 대시보드 입소자 목록, 실제 등록된 명단 + 각자 최근 체크인
export async function GET() {
  const workers = listWorkers().map((worker) => ({
    ...worker,
    latest: latestCheckinForWorker(worker.id),
  }));
  return Response.json({ workers });
}

// 관리자가 미리 이름만 등록 (그 사람이 아직 첫 체크인을 안 한 상태로도 목록에 뜨게)
export async function POST(request: Request) {
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

  const worker = addWorkerPlaceholder({ name, team });
  return Response.json({ worker });
}
