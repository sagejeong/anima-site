import StatusPill from "@/components/hub/StatusPill";
import { DEMO_ALERTS_HISTORY, DEMO_RESIDENTS } from "@/lib/dashboard-demo";

// 발표용 알림 이력, 대시보드랑 같은 예시 데이터로 최근순 정리
export default function AlertsPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
            알림 이력
          </p>
          <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
            이상 감지 기록
          </h1>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
          예시 데이터
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {DEMO_ALERTS_HISTORY.map((alert) => {
          const resident = DEMO_RESIDENTS.find((r) => r.id === alert.residentId);
          return (
            <li
              key={alert.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-steel-surface p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <StatusPill status={alert.status} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-ink">
                    {resident?.label ?? "알 수 없음"}{" "}
                    <span className="font-normal text-ink-soft">
                      · {resident?.room} · {resident?.team}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {alert.session}에서 이탈도 {alert.percent}% 감지
                  </p>
                </div>
              </div>
              <span className="font-hub-mono text-xs text-ink-soft sm:text-right">{alert.when}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
