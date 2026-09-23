// 랜딩 히어로용 "예시 화면" 샘플 데이터. 실 대시보드는 lib/hub-roster.ts 데이터 씀,
// 여긴 명단 비어있어도 항상 그럴듯하게 보이게 하는 용도. 실명 대신 "입소자 XX"만 씀

export type { CheckinStatus as HubStatus } from "./hub-roster";
import type { CheckinStatus as HubStatus } from "./hub-roster";

export type HubWorker = {
  id: string;
  team: string;
  label: string;
  status: HubStatus;
  lastEventAt: string;
  /** 최근 며칠 기침 이탈도(%) 추이, 스파크라인용 0~100 */
  trend: readonly number[];
};

export const HUB_WORKERS: readonly HubWorker[] = [
  {
    id: "w-04",
    team: "3병동",
    label: "입소자 04",
    status: "경고",
    lastEventAt: "3분 전",
    trend: [22, 28, 26, 40, 58, 71, 82],
  },
  {
    id: "w-11",
    team: "2병동",
    label: "입소자 11",
    status: "주의",
    lastEventAt: "8분 전",
    trend: [18, 20, 24, 22, 35, 44, 51],
  },
  {
    id: "w-01",
    team: "1병동",
    label: "입소자 01",
    status: "양호",
    lastEventAt: "방금 전",
    trend: [15, 18, 14, 20, 17, 16, 19],
  },
  {
    id: "w-02",
    team: "1병동",
    label: "입소자 02",
    status: "양호",
    lastEventAt: "1분 전",
    trend: [12, 14, 13, 15, 16, 14, 15],
  },
  {
    id: "w-07",
    team: "재활병동",
    label: "입소자 07",
    status: "양호",
    lastEventAt: "5분 전",
    trend: [20, 19, 22, 21, 18, 20, 21],
  },
  {
    id: "w-09",
    team: "3병동",
    label: "입소자 09",
    status: "주의",
    lastEventAt: "12분 전",
    trend: [25, 30, 28, 34, 38, 42, 47],
  },
] as const;

export type HubAlert = {
  id: string;
  worker: string;
  team: string;
  message: string;
  time: string;
  severity: HubStatus;
};

export const HUB_ALERTS: readonly HubAlert[] = [
  {
    id: "a-1",
    worker: "입소자 04",
    team: "3병동",
    message: "기침 이탈도가 평소 대비 급격히 상승했습니다.",
    time: "오늘 14:32",
    severity: "경고",
  },
  {
    id: "a-2",
    worker: "입소자 11",
    team: "2병동",
    message: "최근 3회 측정에서 이탈도가 지속적으로 상승 중입니다.",
    time: "오늘 13:58",
    severity: "주의",
  },
  {
    id: "a-3",
    worker: "입소자 09",
    team: "3병동",
    message: "최근 3회 측정에서 이탈도가 지속적으로 상승 중입니다.",
    time: "오늘 11:20",
    severity: "주의",
  },
  {
    id: "a-4",
    worker: "입소자 06",
    team: "재활병동",
    message: "기침 이탈도가 기준을 초과했습니다.",
    time: "어제 17:41",
    severity: "경고",
  },
] as const;

export type TeamAverage = {
  team: string;
  average: number;
  status: HubStatus;
};

function statusFromAverage(average: number): HubStatus {
  if (average >= 45) return "경고";
  if (average >= 28) return "주의";
  return "양호";
}

// 병동별 최근 이탈도 평균
export function hubTeamAverages(workers: readonly HubWorker[]): readonly TeamAverage[] {
  const byTeam = new Map<string, number[]>();
  for (const worker of workers) {
    const latest = worker.trend[worker.trend.length - 1];
    byTeam.set(worker.team, [...(byTeam.get(worker.team) ?? []), latest]);
  }

  return Array.from(byTeam.entries())
    .map(([team, values]) => {
      const average = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
      return { team, average, status: statusFromAverage(average) };
    })
    .sort((a, b) => b.average - a.average);
}

export function hubStatusCounts(workers: readonly HubWorker[]): Record<HubStatus, number> {
  return workers.reduce(
    (counts, worker) => {
      counts[worker.status] += 1;
      return counts;
    },
    { 양호: 0, 주의: 0, 경고: 0 } as Record<HubStatus, number>,
  );
}
