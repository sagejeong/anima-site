"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import StatusPill from "@/components/hub/StatusPill";
import { BellIcon, PeopleIcon, ShieldIcon, WarningIcon } from "@/components/hub/icons";
import {
  DEMO_ALERTS,
  DEMO_RESIDENTS,
  clamp,
  statusFor,
  type DemoAlert,
  type DemoResident,
} from "@/lib/dashboard-demo";
import type { CheckinStatus } from "@/lib/hub-roster";

const TICK_MS = 2600;
const FLASH_MS = 10000;
const MAX_ALERTS = 6;

// 예시용 실시간 목록. 3초마다 입소자 한 명 이탈도 바꿔서 재정렬, kpi·알림은 거기서 파생.
// setState 콜백 안에 또 setState 넣었다가 알림 중복 생기던 거 고쳐서 ref로 최신값 들고 씀.
export default function LiveDashboard() {
  const [residents, setResidents] = useState<readonly DemoResident[]>(DEMO_RESIDENTS);
  const [alerts, setAlerts] = useState<readonly DemoAlert[]>(DEMO_ALERTS);
  const [flashId, setFlashId] = useState<string | null>(null);

  const residentsRef = useRef(residents);
  const alertSeqRef = useRef(0);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevTops = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    residentsRef.current = residents;
  }, [residents]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      const prev = residentsRef.current;
      const index = Math.floor(Math.random() * prev.length);
      const target = prev[index];
      const isCoughEvent = Math.random() < 0.45;
      const delta = isCoughEvent ? 12 + Math.random() * 28 : Math.random() * 8 - 4;
      const percent = Math.round(clamp(target.percent + delta, 5, 96));
      const status = statusFor(percent);

      const next = [...prev.map((r, i) => (i === index ? { ...r, percent, status } : r))].sort(
        (a, b) => b.percent - a.percent
      );
      residentsRef.current = next;
      setResidents(next);

      if (!isCoughEvent) return;

      setFlashId(target.id);
      window.setTimeout(() => setFlashId((current) => (current === target.id ? null : current)), FLASH_MS);

      if (status === "양호") return;

      const now = new Date();
      const when = `방금 ${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      alertSeqRef.current += 1;
      const newAlert: DemoAlert = {
        id: `live-${alertSeqRef.current}`,
        residentId: target.id,
        session: now.getHours() < 13 ? "오전 체크" : "오후 체크",
        percent,
        status,
        when,
      };
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts].slice(0, MAX_ALERTS));
    }, TICK_MS);

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
  }, [residents]);

  const counts: Record<CheckinStatus, number> = { 양호: 0, 주의: 0, 경고: 0 };
  for (const r of residents) counts[r.status] += 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiTile label="전체 인원" value={residents.length} icon={PeopleIcon} />
        <KpiTile label="양호" value={counts.양호} tone="양호" icon={ShieldIcon} />
        <KpiTile label="주의" value={counts.주의} tone="주의" icon={WarningIcon} />
        <KpiTile label="경고" value={counts.경고} tone="경고" icon={BellIcon} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-line bg-steel-surface lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <p className="text-sm font-bold text-ink">입소자 실시간 현황</p>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
              예시 데이터
            </span>
          </div>
          <div className="flex flex-col divide-y divide-line px-2">
            {residents.map((resident) => (
              <div
                key={resident.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(resident.id, el);
                  else nodeRefs.current.delete(resident.id);
                }}
                className={`flex items-center justify-between gap-3 px-3 py-3.5 transition-colors duration-500 ${
                  flashId === resident.id ? "bg-critical/10" : ""
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-ink">{resident.label}</p>
                  <p className="text-xs text-ink-soft">
                    {resident.room} · {resident.team}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="font-hub-mono text-sm font-semibold tabular-nums text-ink-soft">
                    {resident.percent}%
                  </span>
                  <StatusPill status={resident.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-steel-surface p-5">
          <p className="text-sm font-bold text-ink">최근 이상 감지</p>
          <ul className="flex flex-col gap-2.5">
            {alerts.map((alert) => {
              const resident = DEMO_RESIDENTS.find((r) => r.id === alert.residentId);
              return (
                <li key={alert.id} className="rounded-xl border border-line px-3.5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ink">{resident?.label ?? "알 수 없음"}</p>
                    <StatusPill status={alert.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    {alert.session} · {alert.percent}% · {alert.when}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
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
