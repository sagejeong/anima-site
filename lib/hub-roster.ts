import fs from "fs";
import path from "path";

// HUB 입소자 명단 + 체크인 기록 임시 저장소. FastAPI엔 "회사/입소자/전후" 개념이
// 없어서 매핑만 파일로 들고 있고, 분석값(정확도/이탈도)은 FastAPI 계산값 그대로 씀.
// 파일 기반이라 로컬/VPS는 되는데 Vercel 같은 서버리스는 안 됨. DB 이전 필요, README 참고.

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "hub-roster.json");

export type CheckinSession = "before" | "after";
export type CheckinStatus = "양호" | "주의" | "경고";

export type RosterWorker = {
  id: string;
  name: string;
  team: string;
  /** 아직 본인 폰으로 첫 체크인을 안 했으면 null (관리자가 미리 등록만 해둔 상태) */
  userUuid: string | null;
  registeredAt: string;
};

export type Checkin = {
  id: string;
  workerId: string;
  session: CheckinSession;
  measuredAt: string;
  isCough: boolean;
  /** 실패(기침 미감지 등)면 null */
  percent: number | null;
  status: CheckinStatus | null;
  failReason: string | null;
};

type Store = {
  workers: RosterWorker[];
  checkins: Checkin[];
};

function readStore(): Store {
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return { workers: parsed.workers ?? [], checkins: parsed.checkins ?? [] };
  } catch {
    return { workers: [], checkins: [] };
  }
}

function writeStore(store: Store): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function listWorkers(): RosterWorker[] {
  return readStore().workers;
}

export function findWorkerByUuid(userUuid: string): RosterWorker | null {
  return readStore().workers.find((worker) => worker.userUuid === userUuid) ?? null;
}

export function findWorkerById(id: string): RosterWorker | null {
  return readStore().workers.find((worker) => worker.id === id) ?? null;
}

/** 입소자가 /checkin에서 처음 이름 입력할 때 씀, 이 폰 UUID에 이름 붙이는 것 */
export function registerWorkerForUuid(params: {
  name: string;
  team: string;
  userUuid: string;
}): RosterWorker {
  const store = readStore();
  const existing = store.workers.find((worker) => worker.userUuid === params.userUuid);
  if (existing) {
    existing.name = params.name;
    existing.team = params.team;
    writeStore(store);
    return existing;
  }

  const worker: RosterWorker = {
    id: makeId("w"),
    name: params.name,
    team: params.team,
    userUuid: params.userUuid,
    registeredAt: new Date().toISOString(),
  };
  store.workers.push(worker);
  writeStore(store);
  return worker;
}

/** 관리자가 대시보드에서 미리 이름만 등록해두는 경우 (아직 그 사람 폰이랑 안 연결됨) */
export function addWorkerPlaceholder(params: { name: string; team: string }): RosterWorker {
  const store = readStore();
  const worker: RosterWorker = {
    id: makeId("w"),
    name: params.name,
    team: params.team,
    userUuid: null,
    registeredAt: new Date().toISOString(),
  };
  store.workers.push(worker);
  writeStore(store);
  return worker;
}

/** 관리자가 잘못 등록했거나 더 이상 필요 없는 입소자를 명단에서 지울 때 씀. 체크인 기록도 같이 지움 */
export function removeWorker(id: string): boolean {
  const store = readStore();
  const nextWorkers = store.workers.filter((worker) => worker.id !== id);
  if (nextWorkers.length === store.workers.length) return false;

  store.workers = nextWorkers;
  store.checkins = store.checkins.filter((checkin) => checkin.workerId !== id);
  writeStore(store);
  return true;
}

export function addCheckin(entry: Omit<Checkin, "id">): Checkin {
  const store = readStore();
  const checkin: Checkin = { id: makeId("c"), ...entry };
  store.checkins.push(checkin);
  writeStore(store);
  return checkin;
}

export function listCheckins(): Checkin[] {
  return [...readStore().checkins].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
}

export function listCheckinsForWorker(workerId: string): Checkin[] {
  return listCheckins().filter((checkin) => checkin.workerId === workerId);
}

export function latestCheckinForWorker(workerId: string): Checkin | null {
  const list = listCheckinsForWorker(workerId);
  return list.length > 0 ? list[list.length - 1] : null;
}

/** 오늘 날짜(YYYY-MM-DD, 로컬 기준)의 오전/오후 체크인 쌍 */
export function todaysPairForWorker(
  workerId: string,
): { before: Checkin | null; after: Checkin | null } {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todays = listCheckinsForWorker(workerId).filter(
    (checkin) => checkin.measuredAt.slice(0, 10) === todayKey,
  );
  return {
    before: [...todays].reverse().find((c) => c.session === "before") ?? null,
    after: [...todays].reverse().find((c) => c.session === "after") ?? null,
  };
}

function average(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/** 오늘 전체 입소자 기준 오전/오후 평균 이탈도 (데이터 없으면 null) */
export function todayAverageBySession(): {
  before: number | null;
  after: number | null;
  beforeCount: number;
  afterCount: number;
} {
  const todayKey = new Date().toISOString().slice(0, 10);
  const todays = listCheckins().filter(
    (c) => c.measuredAt.slice(0, 10) === todayKey && c.percent !== null,
  );
  const before = todays.filter((c) => c.session === "before").map((c) => c.percent as number);
  const after = todays.filter((c) => c.session === "after").map((c) => c.percent as number);
  return {
    before: average(before),
    after: average(after),
    beforeCount: before.length,
    afterCount: after.length,
  };
}

/** 최근 N일간, "오후" 체크인이 실제로 있었던 날짜만 평균 이탈도로 반환 */
export function recentAfterAverages(days: number): { date: string; average: number }[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const byDate = new Map<string, number[]>();

  for (const checkin of listCheckins()) {
    if (checkin.session !== "after" || checkin.percent === null) continue;
    const time = new Date(checkin.measuredAt).getTime();
    if (Number.isNaN(time) || time < cutoff) continue;
    const dateKey = checkin.measuredAt.slice(0, 10);
    byDate.set(dateKey, [...(byDate.get(dateKey) ?? []), checkin.percent]);
  }

  return Array.from(byDate.entries())
    .map(([date, values]) => ({ date, average: average(values) as number }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
