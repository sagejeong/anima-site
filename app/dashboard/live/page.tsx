"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import LineChart from "@/components/hub/LineChart";
import StatusPill from "@/components/hub/StatusPill";
import { BellIcon, PeopleIcon, ShieldIcon, WarningIcon } from "@/components/hub/icons";
import type { Checkin, CheckinStatus, RosterWorker } from "@/lib/hub-roster";

type WorkerRow = RosterWorker & { latest: Checkin | null };

type Alert = {
  id: string;
  workerId: string;
  name: string;
  team: string;
  percent: number;
  status: CheckinStatus;
  when: string;
};

type LiveStats = {
  today: {
    morning: number | null;
    afternoon: number | null;
    morningCount: number;
    afternoonCount: number;
  };
  weekly: { date: string; average: number }[];
};

const EMPTY_STATS: LiveStats = {
  today: { morning: null, afternoon: null, morningCount: 0, afternoonCount: 0 },
  weekly: [],
};

const POLL_MS = 3000;
const FLASH_MS = 10000;
const MAX_ALERTS = 8;

function sortByLatest(rows: readonly WorkerRow[]): WorkerRow[] {
  return [...rows].sort((a, b) => {
    const aTime = a.latest ? new Date(a.latest.measuredAt).getTime() : 0;
    const bTime = b.latest ? new Date(b.latest.measuredAt).getTime() : 0;
    return bTime - aTime;
  });
}

function formatElapsed(measuredAt: string): string {
  const diffMs = Date.now() - new Date(measuredAt).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 측정됨";
  if (minutes < 60) return `${minutes}분 전 측정`;
  const hours = Math.floor(minutes / 60);
  return `${hours}시간 전 측정`;
}

// 예시 데이터가 전혀 없는 실제 대시보드. 등록된 팀원의 앱 UUID로 FastAPI 기록을
// 주기적으로 끌어와서, 전체 현황(KPI)·실시간 목록·이상 감지를 그 데이터로만 채움
export default function LiveDashboardPage() {
  const [rows, setRows] = useState<readonly WorkerRow[]>([]);
  const [alerts, setAlerts] = useState<readonly Alert[]>([]);
  const [stats, setStats] = useState<LiveStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [userUuid, setUserUuid] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const latestIdsRef = useRef<Map<string, string>>(new Map());
  const alertSeqRef = useRef(0);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevTops = useRef<Map<string, number>>(new Map());

  const applyRows = (next: WorkerRow[]) => {
    const sorted = sortByLatest(next);
    const newAlerts: Alert[] = [];

    for (const row of sorted) {
      const prevLatestId = latestIdsRef.current.get(row.id);
      const currentLatestId = row.latest?.id;
      if (currentLatestId && currentLatestId !== prevLatestId) {
        setFlashId(row.id);
        window.setTimeout(() => setFlashId((cur) => (cur === row.id ? null : cur)), FLASH_MS);

        if (row.latest && row.latest.status && row.latest.status !== "양호" && prevLatestId !== undefined) {
          alertSeqRef.current += 1;
          newAlerts.push({
            id: `a-${alertSeqRef.current}`,
            workerId: row.id,
            name: row.name,
            team: row.team,
            percent: row.latest.percent ?? 0,
            status: row.latest.status,
            when: "방금",
          });
        }
      }
      if (currentLatestId) latestIdsRef.current.set(row.id, currentLatestId);
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, MAX_ALERTS));
    }
    setRows(sorted);
  };

  const loadRows = async () => {
    const res = await fetch("/api/hub/workers");
    const body: { workers: WorkerRow[]; stats?: LiveStats } = await res.json();
    const liveRows = body.workers.filter((w) => w.userUuid);
    // 처음 불러올 때는 "새 기록" 알림을 띄우지 않고, 현재 상태만 기준점으로 잡아둠
    for (const row of liveRows) {
      if (row.latest?.id) latestIdsRef.current.set(row.id, row.latest.id);
    }
    setRows(sortByLatest(liveRows));
    if (body.stats) setStats(body.stats);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadRows();

    const timer = window.setInterval(async () => {
      const res = await fetch("/api/hub/sync", { method: "POST" });
      if (!res.ok) return;
      const body: { workers: WorkerRow[]; stats?: LiveStats } = await res.json();
      applyRows(body.workers.filter((w) => w.userUuid));
      if (body.stats) setStats(body.stats);
    }, POLL_MS);

    return () => window.clearInterval(timer);
  }, []);

  useLayoutEffect(() => {
    const nextTops = new Map<string, number>();
    nodeRefs.current.forEach((el, id) => nextTops.set(id, el.getBoundingClientRect().top));

    nodeRefs.current.forEach((el, id) => {
      const prevTop = prevTops.current.get(id);
      const nextTop = nextTops.get(id);
      if (prevTop === undefined || nextTop === undefined) return;
      const delta = prevTop - nextTop;
      if (!delta) return;

      el.style.transition = "none";
      el.style.transform = `translateY(${delta}px)`;
      requestAnimationFrame(() => {
        el.style.transition = "transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1)";
        el.style.transform = "";
      });
    });

    prevTops.current = nextTops;
  }, [rows]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !team.trim() || !userUuid.trim()) return;
    setErrorMessage(null);

    const response = await fetch("/api/hub/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, team, userUuid: userUuid.trim() }),
    });
    const body = await response.json();

    if (!response.ok) {
      setErrorMessage(body.error ?? "등록에 실패했습니다.");
      return;
    }

    setName("");
    setTeam("");
    setUserUuid("");
    setIsFormOpen(false);
    void loadRows();
  };

  const handleDelete = async (row: WorkerRow) => {
    if (!window.confirm(`${row.name} 님을 연동 목록에서 지울까요?`)) return;
    const response = await fetch(`/api/hub/workers/${row.id}`, { method: "DELETE" });
    if (response.ok) void loadRows();
  };

  const counts: Record<CheckinStatus, number> = { 양호: 0, 주의: 0, 경고: 0 };
  for (const row of rows) {
    if (row.latest?.status) counts[row.latest.status] += 1;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
            실시간 연동
          </p>
          <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
            앱 연동 실시간 대시보드
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            예시 데이터가 섞여 있지 않습니다. 등록한 팀원이 앱에서 기침을 녹음하면, 그 결과가 몇
            초 안에 그대로 반영됩니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
        >
          {isFormOpen ? "닫기" : "+ 팀원 등록"}
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="grid gap-4 rounded-2xl border border-line bg-steel-surface p-6 sm:grid-cols-2"
        >
          <label className="block">
            <span className="text-sm font-bold text-ink">이름</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 김OO"
              required
              className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink">소속</span>
            <input
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              placeholder="예: 1팀"
              required
              className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-bold text-ink">앱 UUID</span>
            <input
              value={userUuid}
              onChange={(event) => setUserUuid(event.target.value)}
              placeholder="앱 설정 → 내 정보 → 내 UUID에서 복사한 값을 붙여넣기"
              required
              className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 font-hub-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-steel transition-colors hover:bg-primary sm:col-span-2 sm:w-fit"
          >
            등록
          </button>
          {errorMessage && <p className="text-sm font-bold text-critical sm:col-span-2">{errorMessage}</p>}
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-steel-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">오늘 오전 → 오후</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-good/10 px-2.5 py-1 text-[10px] font-bold text-good">
              <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
              LIVE
            </span>
          </div>
          {stats.today.morning === null && stats.today.afternoon === null ? (
            <p className="mt-6 text-sm text-ink-soft">오늘 측정된 기록이 아직 없습니다.</p>
          ) : (
            <div className="mt-5 flex items-center justify-center gap-6">
              <BigStat label={`오전 (${stats.today.morningCount}건)`} value={stats.today.morning} />
              <span className="text-2xl text-ink-soft" aria-hidden="true">
                →
              </span>
              <BigStat label={`오후 (${stats.today.afternoonCount}건)`} value={stats.today.afternoon} />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-steel-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">최근 7일 평균 이탈도</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-good/10 px-2.5 py-1 text-[10px] font-bold text-good">
              <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
              LIVE
            </span>
          </div>
          {stats.weekly.length < 2 ? (
            <p className="mt-6 text-sm text-ink-soft">추이를 보려면 며칠 더 데이터가 쌓여야 합니다.</p>
          ) : (
            <LineChart
              points={stats.weekly.map((p) => ({ label: p.date.slice(5), value: p.average }))}
              className="mt-5"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiTile label="연동 인원" value={rows.length} icon={PeopleIcon} />
        <KpiTile label="양호" value={counts.양호} tone="양호" icon={ShieldIcon} />
        <KpiTile label="주의" value={counts.주의} tone="주의" icon={WarningIcon} />
        <KpiTile label="경고" value={counts.경고} tone="경고" icon={BellIcon} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-line bg-steel-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <p className="text-sm font-bold text-ink">연동된 팀원</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-good/10 px-2.5 py-1 text-[10px] font-bold text-good">
              <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
              LIVE
            </span>
          </div>

          {isLoading ? (
            <p className="px-5 py-8 text-center text-sm text-ink-soft">불러오는 중...</p>
          ) : rows.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="font-hub-display text-lg font-extrabold text-ink">
                등록된 팀원이 없습니다
              </p>
              <p className="mt-2 text-sm text-ink-soft">
                위에서 이름·소속·앱 UUID를 등록하면, 그 사람이 앱으로 녹음한 결과가 여기 실시간으로
                쌓입니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-line px-2">
              {rows.map((row) => (
                <div
                  key={row.id}
                  ref={(el) => {
                    if (el) nodeRefs.current.set(row.id, el);
                    else nodeRefs.current.delete(row.id);
                  }}
                  className={`flex items-center justify-between gap-3 px-3 py-4 transition-colors duration-500 ${
                    flashId === row.id ? "bg-critical/10" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-ink">{row.name}</p>
                    <p className="text-xs text-ink-soft">
                      {row.team} · {row.latest ? formatElapsed(row.latest.measuredAt) : "측정 전"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {row.latest?.status ? (
                      <div className="flex items-center gap-2.5">
                        <span className="font-hub-mono text-sm font-semibold tabular-nums text-ink-soft">
                          {row.latest.percent}%
                        </span>
                        <StatusPill status={row.latest.status} />
                      </div>
                    ) : (
                      <span className="text-xs text-ink-soft">측정 전</span>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleDelete(row)}
                      className="text-xs font-bold text-critical underline underline-offset-4"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-steel-surface p-5">
          <p className="text-sm font-bold text-ink">최근 이상 감지</p>
          {alerts.length === 0 ? (
            <p className="text-sm text-ink-soft">아직 주의·경고 기록이 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {alerts.map((alert) => (
                <li key={alert.id} className="rounded-xl border border-line px-3.5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ink">{alert.name}</p>
                    <StatusPill status={alert.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    {alert.team} · {alert.percent}% · {alert.when}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center">
      <p className="font-hub-label text-4xl font-black tabular-nums text-ink">
        {value === null ? "—" : `${value}%`}
      </p>
      <p className="mt-1 text-xs font-semibold text-ink-soft">{label}</p>
    </div>
  );
}

function KpiTile({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone?: CheckinStatus;
  icon: (props: { className?: string }) => React.ReactElement;
}) {
  const toneClass: Record<CheckinStatus, string> = {
    양호: "text-good bg-good/10",
    주의: "text-caution bg-caution/10",
    경고: "text-critical bg-critical/10",
  };

  return (
    <div className="rounded-2xl border border-line bg-steel-surface px-5 py-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            tone ? toneClass[tone] : "bg-ink/5 text-ink-soft"
          }`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-hub-label text-4xl font-extrabold tabular-nums text-ink">{value}</p>
    </div>
  );
}
