"use client";

import { useEffect, useState } from "react";
import StatusPill from "@/components/hub/StatusPill";
import type { Checkin, CheckinSession } from "@/lib/hub-roster";
import { formatMeasuredAt } from "@/lib/result";

type AlertRow = Checkin & { workerName: string; workerTeam: string };

const SESSION_LABEL: Record<CheckinSession, string> = {
  before: "오전 체크",
  after: "오후 체크",
  app: "앱 연동",
};

// 실제 체크인 기록 기준 알림 이력. 예시 데이터 없음
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<readonly AlertRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hub/alerts")
      .then((res) => res.json())
      .then((body: { alerts: AlertRow[] }) => setAlerts(body.alerts))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div>
        <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
          알림 이력
        </p>
        <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
          이상 감지 기록
        </h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-soft">불러오는 중...</p>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-steel-surface p-10 text-center">
          <p className="font-hub-display text-lg font-extrabold text-ink">아직 알림이 없습니다</p>
          <p className="mt-2 text-sm text-ink-soft">
            체크인 결과가 주의·경고 단계일 때 여기 쌓입니다.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-steel-surface p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                {alert.status && <StatusPill status={alert.status} className="mt-0.5 shrink-0" />}
                <div>
                  <p className="font-bold text-ink">
                    {alert.workerName} <span className="font-normal text-ink-soft">· {alert.workerTeam}</span>
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {SESSION_LABEL[alert.session]}에서 이탈도 {alert.percent}% 감지
                  </p>
                </div>
              </div>
              <span className="font-hub-mono text-xs text-ink-soft sm:text-right">
                {formatMeasuredAt(alert.measuredAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
