import { animaUrl, callAnimaApi } from "@/lib/anima-api";
import {
  addCheckin,
  hasCheckinFromRecord,
  latestCheckinForWorker,
  listWorkers,
  recentDailyAveragesForWorkers,
  todayAverageForWorkers,
  type CheckinStatus,
} from "@/lib/hub-roster";
import {
  RISK_COPY,
  classifyRisk,
  parseServerDate,
  pickRecordDate,
  toDisplayPercent,
  type RecordsListResponse,
} from "@/lib/result";

// 앱 UUID로 등록된 입소자들의 FastAPI 기록을 새로 조회해서 끌어옴.
// 대시보드가 이 엔드포인트를 몇 초마다 호출해서 실시간처럼 보이게 함
export async function POST() {
  const workers = listWorkers().filter((worker) => worker.userUuid);

  for (const worker of workers) {
    const result = await callAnimaApi<RecordsListResponse>(
      animaUrl("/records", { user_uuid: worker.userUuid as string }),
    );
    if (!result.ok) continue;

    for (const record of result.data.records ?? []) {
      if (!record.record_uuid || typeof record.healthy_distance !== "number") continue;
      if (hasCheckinFromRecord(worker.id, record.record_uuid)) continue;

      const distance = record.healthy_distance;
      const recordDate = pickRecordDate(record);
      addCheckin({
        workerId: worker.id,
        session: "app",
        measuredAt: recordDate ? parseServerDate(recordDate).toISOString() : new Date().toISOString(),
        isCough: true,
        percent: Math.round(toDisplayPercent(distance)),
        status: RISK_COPY[classifyRisk(distance)].label as CheckinStatus,
        failReason: null,
        sourceRecordUuid: record.record_uuid,
      });
    }
  }

  const updated = listWorkers().map((worker) => ({
    ...worker,
    latest: latestCheckinForWorker(worker.id),
  }));

  const liveWorkerIds = workers.map((w) => w.id);
  const stats = {
    today: todayAverageForWorkers(liveWorkerIds),
    weekly: recentDailyAveragesForWorkers(liveWorkerIds, 7),
  };

  return Response.json({ workers: updated, stats });
}
