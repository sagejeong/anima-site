"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import StatusPill from "@/components/hub/StatusPill";
import type { CheckinStatus } from "@/lib/hub-roster";

type Resident = {
  id: string;
  room: string;
  percent: number;
  status: CheckinStatus;
};

const INITIAL_RESIDENTS: readonly Resident[] = [
  { id: "r1", room: "301호", percent: 18, status: "양호" },
  { id: "r2", room: "204호", percent: 24, status: "양호" },
  { id: "r3", room: "112호", percent: 31, status: "주의" },
  { id: "r4", room: "108호", percent: 15, status: "양호" },
] as const;

const TICK_MS = 3000;
const FLASH_MS = 10000;

function statusFor(percent: number): CheckinStatus {
  if (percent >= 55) return "경고";
  if (percent >= 30) return "주의";
  return "양호";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// FeatureShowcase 첫 슬라이드용 자동재생 데모. 정렬 로직은 app/dashboard랑 같음, 숫자는 가짜.
export default function LiveMonitorDemo() {
  const [residents, setResidents] = useState<readonly Resident[]>(INITIAL_RESIDENTS);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [logLine, setLogLine] = useState<string | null>(null);

  const residentsRef = useRef(residents);
  const nodeRefs = useRef<Map<string, HTMLLIElement>>(new Map());
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
      const isCoughEvent = Math.random() < 0.55;
      const delta = isCoughEvent ? 14 + Math.random() * 26 : Math.random() * 10 - 5;
      const percent = Math.round(clamp(target.percent + delta, 6, 96));
      const status = statusFor(percent);

      const next = [...prev.map((r, i) => (i === index ? { ...r, percent, status } : r))].sort(
        (a, b) => b.percent - a.percent
      );
      residentsRef.current = next;
      setResidents(next);

      if (!isCoughEvent) return;

      setLogLine(`${target.room} · 방금 기침 감지 · 이탈도 ${percent}%`);
      setFlashId(target.id);
      window.setTimeout(() => setFlashId((current) => (current === target.id ? null : current)), FLASH_MS);
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

  return (
    <div className="flex h-full flex-col justify-center px-4">
      <ul className="flex flex-col divide-y divide-line">
        {residents.map((resident) => (
          <li
            key={resident.id}
            ref={(el) => {
              if (el) nodeRefs.current.set(resident.id, el);
              else nodeRefs.current.delete(resident.id);
            }}
            className={`flex items-center justify-between gap-3 px-2 py-3.5 transition-colors duration-500 ${
              flashId === resident.id ? "bg-critical/10" : ""
            }`}
          >
            <span className="text-sm font-bold text-ink">{resident.room}</span>
            <div className="flex items-center gap-2.5">
              <span className="font-hub-mono text-sm font-semibold tabular-nums text-ink-soft">
                {resident.percent}%
              </span>
              <StatusPill status={resident.status} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 min-h-[1.1rem] px-2 text-xs text-ink-soft">
        {logLine ?? "체크인 이벤트를 기다리는 중..."}
      </p>
    </div>
  );
}
