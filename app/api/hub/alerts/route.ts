import { listCheckins, listWorkers } from "@/lib/hub-roster";

// 실제 체크인 기록 중 주의·경고만 모아서 최신순으로. 예시 데이터 없음
export async function GET() {
  const workers = listWorkers();
  const alerts = listCheckins()
    .filter((checkin) => checkin.status === "주의" || checkin.status === "경고")
    .reverse()
    .map((checkin) => {
      const worker = workers.find((w) => w.id === checkin.workerId);
      return {
        ...checkin,
        workerName: worker?.name ?? "알 수 없음",
        workerTeam: worker?.team ?? "",
      };
    });

  return Response.json({ alerts });
}
