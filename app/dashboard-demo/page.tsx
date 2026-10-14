import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LiveDashboard from "@/components/dashboard/LiveDashboard";
import LineChart from "@/components/hub/LineChart";
import { HomeIcon } from "@/components/hub/icons";
import { DEMO_TODAY_SESSIONS, DEMO_WEEKLY_AFTER } from "@/lib/dashboard-demo";

export const metadata: Metadata = {
  title: "데모 · ANiMA",
};

// 로그인 없이 보는 데모 전용 화면. 더미 데이터로 대시보드가 어떻게 동작하는지만
// 보여주고, 실제 팀원 데이터는 /admin/login으로 들어가야 보임(app/dashboard/page.tsx)
export default function DashboardDemoPage() {
  return (
    <div className="min-h-screen bg-steel font-hub-body text-ink">
      <header className="flex items-center justify-between border-b border-line bg-steel-surface px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/anima_hub_logo.png" alt="ANiMA" width={645} height={119} className="h-6 w-auto sm:h-7" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            DEMO
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-sm font-bold text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            <HomeIcon className="h-4 w-4" />
            홈으로
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            관리자 로그인
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div className="mx-auto flex w-full flex-col gap-6">
          <div>
            <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
              전체 현황
            </p>
            <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
              지금 시설은 이렇습니다
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              더미 데이터로 동작 방식을 보여주는 데모 화면입니다. 실제 데이터는 관리자
              로그인 후 같은 화면 구성으로 보입니다.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-line bg-steel-surface p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">오늘 오전 → 오후</p>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                  예시 데이터
                </span>
              </div>
              <div className="flex flex-1 items-center justify-center gap-6">
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

            <div className="flex flex-col rounded-2xl border border-line bg-steel-surface p-5 sm:p-6">
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
      </main>
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
