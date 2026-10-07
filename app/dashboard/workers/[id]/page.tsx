import Link from "next/link";
import { notFound } from "next/navigation";
import LineChart from "@/components/hub/LineChart";
import StatusPill from "@/components/hub/StatusPill";
import { findWorkerById, listCheckinsForWorker, type Checkin } from "@/lib/hub-roster";

type WorkerDetailPageProps = {
  params: Promise<{ id: string }>;
};

function groupByDay(checkins: readonly Checkin[]): Map<string, { before: Checkin | null; after: Checkin | null }> {
  const byDay = new Map<string, { before: Checkin | null; after: Checkin | null }>();
  for (const checkin of checkins) {
    if (checkin.session !== "before" && checkin.session !== "after") continue;
    const day = checkin.measuredAt.slice(0, 10);
    const entry = byDay.get(day) ?? { before: null, after: null };
    entry[checkin.session] = checkin;
    byDay.set(day, entry);
  }
  return byDay;
}

export default async function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const { id } = await params;
  const worker = findWorkerById(id);
  if (!worker) notFound();

  const checkins = listCheckinsForWorker(worker.id);
  const byDay = Array.from(groupByDay(checkins).entries()).sort(([a], [b]) => b.localeCompare(a));
  const afterTrend = checkins.filter((c) => c.session === "after" && c.percent !== null);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <Link href="/dashboard" className="text-sm font-bold text-ink-soft hover:text-ink">
        ← 전체 현황
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
            {worker.team}
          </p>
          <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">{worker.name}</h1>
          <p className="mt-1 text-xs text-ink-soft">{worker.userUuid ? "본인 폰과 연결됨" : "아직 첫 체크인 전"}</p>
        </div>
      </div>

      {afterTrend.length >= 2 && (
        <div className="rounded-2xl border border-line bg-steel-surface p-6 sm:p-8">
          <p className="text-sm font-bold text-ink">오후 이탈도 추이</p>
          <LineChart
            points={afterTrend.map((c) => ({ label: c.measuredAt.slice(5, 10), value: c.percent as number }))}
            className="mt-6"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-steel-surface">
        <p className="border-b border-line px-6 py-4 text-sm font-bold text-ink">일자별 오전 / 오후</p>
        {byDay.length === 0 ? (
          <p className="px-6 py-6 text-sm text-ink-soft">아직 체크인 기록이 없습니다.</p>
        ) : (
          <ul className="divide-y divide-line">
            {byDay.map(([day, pair]) => (
              <li key={day} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm">
                <span className="font-hub-mono text-ink-soft">{day}</span>
                <div className="flex items-center gap-6">
                  <PairCell label="오전 체크" checkin={pair.before} />
                  <PairCell label="오후 체크" checkin={pair.after} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-ink-soft">입소자가 본인 폰에서 직접 체크인한 실제 결과입니다.</p>
    </div>
  );
}

function PairCell({ label, checkin }: { label: string; checkin: Checkin | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-soft">{label}</span>
      {checkin?.status ? (
        <>
          <StatusPill status={checkin.status} />
          <span className="font-hub-mono text-xs font-semibold text-ink">{checkin.percent}%</span>
        </>
      ) : (
        <span className="text-xs text-ink-soft">—</span>
      )}
    </div>
  );
}
