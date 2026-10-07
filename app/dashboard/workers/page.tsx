"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusPill from "@/components/hub/StatusPill";
import type { Checkin, RosterWorker } from "@/lib/hub-roster";

type WorkerRow = RosterWorker & { latest: Checkin | null };

// 입소자 관리. 예시 데이터 없음, 실제 등록된 명단만 관리. 앱 UUID를 붙이면
// 그 사람이 앱으로 녹음한 기록이 실시간 연동으로 자동 반영됨
export default function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [userUuid, setUserUuid] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      body: JSON.stringify({ name, team, userUuid: userUuid.trim() || undefined }),
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
    loadWorkers();
  };

  const handleDelete = async (worker: WorkerRow) => {
    if (!window.confirm(`${worker.name} 님을 명단에서 지울까요? 체크인 기록도 같이 지워집니다.`)) {
      return;
    }
    setDeletingId(worker.id);
    try {
      const response = await fetch(`/api/hub/workers/${worker.id}`, { method: "DELETE" });
      if (response.ok) {
        loadWorkers();
      }
    } finally {
      setDeletingId(null);
    }
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
              placeholder="예: 3병동"
              required
              className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-bold text-ink">앱 UUID (선택)</span>
            <input
              value={userUuid}
              onChange={(event) => setUserUuid(event.target.value)}
              placeholder="앱 설정 → 내 정보 → 내 UUID에서 복사한 값. 비워두면 이름만 먼저 등록됩니다"
              className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 font-hub-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-steel transition-colors hover:bg-primary sm:w-fit"
          >
            등록
          </button>
          {errorMessage && <p className="text-sm font-bold text-critical sm:col-span-2">{errorMessage}</p>}
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-steel-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <p className="text-sm font-bold text-ink">전체 명단</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-good/10 px-2.5 py-1 text-[10px] font-bold text-good">
            <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
            LIVE
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
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/dashboard/workers/${worker.id}`}
                          className="text-sm font-bold text-primary underline underline-offset-4"
                        >
                          상세보기
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDelete(worker)}
                          disabled={deletingId === worker.id}
                          className="text-sm font-bold text-critical underline underline-offset-4 disabled:opacity-60"
                        >
                          {deletingId === worker.id ? "삭제 중..." : "삭제"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!isLoading && workers.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="font-hub-display text-lg font-extrabold text-ink">
              등록된 입소자가 없습니다
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              위에서 이름·소속을 등록해 주세요. 앱 UUID를 같이 넣으면 그 사람이 앱으로 녹음한
              결과가 바로 연동됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
