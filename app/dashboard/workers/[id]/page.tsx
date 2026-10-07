import Link from "next/link";
import { notFound } from "next/navigation";
import LineChart from "@/components/hub/LineChart";
import StatusPill from "@/components/hub/StatusPill";
import { findWorkerById, listCheckinsForWorker, type CheckinSession } from "@/lib/hub-roster";
import { formatMeasuredAt } from "@/lib/result";

type WorkerDetailPageProps = {
  params: Promise<{ id: string }>;
};

const SESSION_LABEL: Record<CheckinSession, string> = {
  before: "오전 체크",
  after: "오후 체크",
  app: "앱 연동",
};

export default async function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const { id } = await params;
  const worker = findWorkerById(id);
  if (!worker) notFound();

  // 오전/오후 체크인이든 앱 연동(app) 기록이든 전부 한 타임라인으로 보여줌
  const checkins = [...listCheckinsForWorker(worker.id)].reverse();
  const trend = [...checkins].reverse().filter((c) => c.percent !== null);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <Link href="/dashboard/workers" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← 입소자 관리
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
            {worker.team}
          </p>
          <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">{worker.name}</h1>
          <p className="mt-1 text-xs text-ink-soft">{worker.userUuid ? "본인 폰(앱)과 연결됨" : "아직 첫 체크인 전"}</p>
        </div>
      </div>

      {trend.length >= 2 && (
        <div className="rounded-2xl border border-line bg-steel-surface p-6 sm:p-8">
          <p className="text-sm font-bold text-ink">이탈도 추이</p>
          <LineChart
            points={trend.map((c) => ({
              label: c.measuredAt.slice(5, 10),
              value: c.percent as number,
            }))}
            className="mt-6"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-steel-surface">
        <p className="border-b border-line px-6 py-4 text-sm font-bold text-ink">체크인 기록 (최신순)</p>
        {checkins.length === 0 ? (
          <p className="px-6 py-6 text-sm text-ink-soft">아직 체크인 기록이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {checkins.map((checkin) => (
              <li key={checkin.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
                <div>
                  <span className="font-hub-mono text-xs text-ink-soft">{formatMeasuredAt(checkin.measuredAt)}</span>
                  <span className="ml-2 text-xs font-semibold text-ink-soft">{SESSION_LABEL[checkin.session]}</span>
                </div>
                {checkin.status ? (
                  <div className="flex items-center gap-2">
                    <StatusPill status={checkin.status} />
                    <span className="font-hub-mono text-xs font-semibold text-ink">{checkin.percent}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-ink-soft">{checkin.failReason ?? "측정 실패"}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-ink-soft">본인 폰(또는 앱)에서 직접 체크인한 실제 결과입니다.</p>
    </div>
  );
}
