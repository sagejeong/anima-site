"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/hub/StatusPill";
import { DEMO_RESIDENTS } from "@/lib/dashboard-demo";
import type { Checkin, RosterWorker } from "@/lib/hub-roster";

type WorkerRow = RosterWorker & { latest: Checkin | null };

const DEMO_ROWS = DEMO_RESIDENTS.map((resident) => ({
  id: resident.id,
  name: resident.label,
  team: resident.team,
  percent: resident.percent,
  status: resident.status,
}));

// 입소자 관리. 등록 폼은 실제로 동작함, 아래 목록엔 예시 입소자도 "예시" 표시로 같이 섞어 보여줌
export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadWorkers = () => {
    fetch("/api/hub/workers")
      .then((res) => res.json())
      .then((body: { workers: WorkerRow[] }) => setWorkers(body.workers))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !team.trim()) return;
    setErrorMessage(null);

    const response = await fetch("/api/hub/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, team }),
    });
    const body = await response.json();

    if (!response.ok) {
      setErrorMessage(body.error ?? "등록에 실패했습니다.");
      return;
    }

    setName("");
    setTeam("");
    setIsFormOpen(false);
    loadWorkers();
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
            입소자 관리
          </p>
          <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
            등록 · 배정 관리
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
        >
          {isFormOpen ? "닫기" : "+ 새 입소자 등록"}
        </button>
      </div>

      {isFormOpen && (
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="grid gap-4 rounded-2xl border border-line bg-steel-surface p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
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
            <span className="text-sm font-bold text-ink">소속 병동</span>
            <input
              value={team}
              onChange={(event) => setTeam(event.target.value)}
              placeholder="예: 3병동"
              required
              className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-steel transition-colors hover:bg-primary"
          >
            등록
          </button>
          {errorMessage && <p className="text-sm font-bold text-critical sm:col-span-3">{errorMessage}</p>}
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-steel-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <p className="text-sm font-bold text-ink">전체 명단</p>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
            예시 데이터 포함
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3.5">소속</th>
                <th className="px-5 py-3.5">이름</th>
                <th className="px-5 py-3.5">최근 결과</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!isLoading &&
                workers.map((worker) => (
                  <tr key={worker.id} className="transition-colors hover:bg-steel/60">
                    <td className="px-5 py-4 text-ink-soft">{worker.team}</td>
                    <td className="px-5 py-4 font-bold text-ink">{worker.name}</td>
                    <td className="px-5 py-4">
                      {worker.latest?.status ? (
                        <StatusPill status={worker.latest.status} />
                      ) : (
                        <span className="text-xs text-ink-soft">측정 전</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/dashboard/workers/${worker.id}`}
                        className="text-sm font-bold text-primary underline underline-offset-4"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              {DEMO_ROWS.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-steel/60">
                  <td className="px-5 py-4 text-ink-soft">{row.team}</td>
                  <td className="px-5 py-4 font-bold text-ink">
                    {row.name}{" "}
                    <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      예시
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <StatusPill status={row.status} />
                      <span className="font-hub-mono text-xs text-ink-soft">{row.percent}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4" />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-ink-soft">
        위 목록 중 &ldquo;예시&rdquo; 표시가 붙은 항목은 화면 구성을 보여주기 위한 데모 데이터입니다.
        나머지는 여기서 직접 등록한 실제 명단입니다.
      </p>
    </div>
  );
}
