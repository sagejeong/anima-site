import LiveDashboard from "@/components/dashboard/LiveDashboard";
import LineChart from "@/components/hub/LineChart";
import { DEMO_TODAY_SESSIONS, DEMO_WEEKLY_AFTER } from "@/lib/dashboard-demo";

// 발표용 대시보드 개요. hub-roster 실 체크인과 분리된 예시 데이터, 배지로 계속 표시
export default function DashboardOverviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
          전체 현황
        </p>
        <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
          지금 시설은 이렇습니다
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          예시 데이터로 동작 방식을 보여주는 화면입니다. 실제 서비스에서는 입소자들이 본인 폰으로
          체크인한 결과가 여기 그대로 쌓입니다.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-steel-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">오늘 오전 → 오후</p>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              예시 데이터
            </span>
          </div>
          <div className="mt-5 flex items-center justify-center gap-6">
            <BigStat
              label={`오전 체크 (${DEMO_TODAY_SESSIONS.beforeCount}명)`}
              value={DEMO_TODAY_SESSIONS.before}
            />
            <span className="text-2xl text-ink-soft" aria-hidden="true">
              →
            </span>
            <BigStat
              label={`오후 체크 (${DEMO_TODAY_SESSIONS.afterCount}명)`}
              value={DEMO_TODAY_SESSIONS.after}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-steel-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink">최근 7일 오후 평균 이탈도</p>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              예시 데이터
            </span>
          </div>
          <LineChart
            points={DEMO_WEEKLY_AFTER.map((p) => ({ label: p.date, value: p.average }))}
            className="mt-5"
          />
        </div>
      </div>

      <LiveDashboard />
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
