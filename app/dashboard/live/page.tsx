"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import StatusPill from "@/components/hub/StatusPill";
import type { Checkin, CheckinStatus, RosterWorker } from "@/lib/hub-roster";

type WorkerRow = RosterWorker & { latest: Checkin | null };

const POLL_MS = 3000;
const FLASH_MS = 10000;

function sortByLatest(rows: readonly WorkerRow[]): WorkerRow[] {
  return [...rows].sort((a, b) => {
    const aTime = a.latest ? new Date(a.latest.measuredAt).getTime() : 0;
    const bTime = b.latest ? new Date(b.latest.measuredAt).getTime() : 0;
    return bTime - aTime;
  });
}

// 앱에서 실제로 녹음한 기록이 대시보드에 그대로 들어오는지 보여주는 화면.
// 예시 데이터 없음, 등록된 사람의 FastAPI 기록을 주기적으로 끌어와서 반영함
export default function LiveSyncPage() {
  const [rows, setRows] = useState<readonly WorkerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [userUuid, setUserUuid] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const latestIdsRef = useRef<Map<string, string>>(new Map());
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevTops = useRef<Map<string, number>>(new Map());

  const applyRows = (next: WorkerRow[]) => {
    const sorted = sortByLatest(next);

    for (const row of sorted) {
      const prevLatestId = latestIdsRef.current.get(row.id);
      const currentLatestId = row.latest?.id;
      if (currentLatestId && currentLatestId !== prevLatestId) {
        setFlashId(row.id);
        window.setTimeout(() => setFlashId((cur) => (cur === row.id ? null : cur)), FLASH_MS);
      }
      if (currentLatestId) latestIdsRef.current.set(row.id, currentLatestId);
    }

    setRows(sorted);
  };

  const loadRows = async () => {
    const res = await fetch("/api/hub/workers");
    const body: { workers: WorkerRow[] } = await res.json();
    applyRows(body.workers.filter((w) => w.userUuid));
    setIsLoading(false);
  };

  useEffect(() => {
    void loadRows();

    const timer = window.setInterval(async () => {
      const res = await fetch("/api/hub/sync", { method: "POST" });
      if (!res.ok) return;
      const body: { workers: WorkerRow[] } = await res.json();
      applyRows(body.workers.filter((w) => w.userUuid));
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

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
            실시간 연동
          </p>
          <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
            앱 녹음 결과 실시간 반영
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            예시 데이터 없이, 등록한 사람이 앱에서 기침을 녹음하면 그 결과가 몇 초 안에 그대로
            여기 반영됩니다.
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

      <div className="overflow-hidden rounded-2xl border border-line bg-steel-surface">
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
                    {row.team} ·{" "}
                    {row.latest ? formatElapsed(row.latest.measuredAt) : "측정 전"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {row.latest?.status ? (
                    <div className="flex items-center gap-2.5">
                      <span className="font-hub-mono text-sm font-semibold tabular-nums text-ink-soft">
                        {row.latest.percent}%
                      </span>
                      <StatusPill status={row.latest.status as CheckinStatus} />
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
    </div>
  );
}

function formatElapsed(measuredAt: string): string {
  const diffMs = Date.now() - new Date(measuredAt).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "방금 측정됨";
  if (minutes < 60) return `${minutes}분 전 측정`;
  const hours = Math.floor(minutes / 60);
  return `${hours}시간 전 측정`;
}
