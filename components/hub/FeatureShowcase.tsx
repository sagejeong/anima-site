"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DownloadIcon } from "@/components/hub/icons";
import LiveMonitorDemo from "@/components/hub/LiveMonitorDemo";
import { HUB_WORKERS, hubTeamAverages, type HubStatus } from "@/lib/hub-mock";

const SPARK_COLOR: Record<HubStatus, string> = {
  양호: "var(--color-good)",
  주의: "var(--color-caution)",
  경고: "var(--color-critical)",
};

const ROTATE_MS = 4500;
const FADE_MS = 600;

type Slide = {
  id: string;
  tag: string;
  render: () => React.ReactNode;
};

const teamAverages = hubTeamAverages(HUB_WORKERS);
const teamMax = Math.max(...teamAverages.map((t) => t.average), 10);

const SLIDES: readonly Slide[] = [
  {
    id: "overview",
    tag: "실시간 모니터링",
    render: () => <LiveMonitorDemo />,
  },
  {
    id: "trend",
    tag: "오전 · 오후 비교",
    render: () => (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-6">
        <p className="text-xs font-bold text-ink-soft">오늘 시설 평균 이탈도</p>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="font-hub-label text-4xl font-black text-ink">18%</p>
            <p className="mt-1 text-xs font-semibold text-ink-soft">오전 체크</p>
          </div>
          <span className="text-2xl text-ink-soft" aria-hidden="true">→</span>
          <div className="text-center">
            <p className="font-hub-label text-4xl font-black text-caution">34%</p>
            <p className="mt-1 text-xs font-semibold text-ink-soft">오후 체크</p>
          </div>
        </div>
        <p className="max-w-[220px] text-center text-xs text-ink-soft">
          같은 날 오전/오후로 두 번 체크인해서, 변화를 있는 그대로 비교합니다.
        </p>
      </div>
    ),
  },
  {
    id: "teams",
    tag: "병동별 평균",
    render: () => (
      <div className="flex h-full flex-col justify-center gap-5 px-6 py-6">
        {teamAverages.map((team) => (
          <div key={team.team} className="flex items-center gap-3">
            <span className="w-16 shrink-0 truncate text-xs font-bold text-ink-soft">{team.team}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(team.average / teamMax) * 100}%`,
                  background: SPARK_COLOR[team.status],
                }}
              />
            </div>
            <span className="w-9 shrink-0 text-right font-hub-mono text-xs font-bold text-ink">
              {team.average}%
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "reports",
    tag: "리포트",
    render: () => (
      <div className="flex h-full flex-col justify-center gap-3 px-6 py-6">
        {["주간 시설 리포트", "병동별 리포트", "입소자별 리포트"].map((title) => (
          <div
            key={title}
            className="flex items-center justify-between rounded-xl border border-line px-4 py-3.5"
          >
            <span className="text-sm font-bold text-ink">{title}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-bold text-ink-soft">
              <DownloadIcon className="h-3.5 w-3.5" />
              PDF
            </span>
          </div>
        ))}
      </div>
    ),
  },
] as const;

// 히어로 기능 쇼케이스. 화면 4개(현황/추이/병동별/리포트) 페이드로 돌림, "예시 화면" 배지 표시
export default function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const active = SLIDES[activeIndex];

  return (
    <div className="w-full max-w-xl">
      <div
        className="overflow-hidden rounded-2xl border border-line bg-steel-surface shadow-[0_24px_60px_-24px_rgba(36,31,26,0.25)]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center justify-between border-b border-line bg-charcoal px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Image src="/anima_hub_logo.png" alt="ANiMA" width={645} height={119} className="h-6 w-auto opacity-80 sm:h-7" />
            <span className="text-xs font-bold tracking-[0.2em] text-ink/70">· {active.tag}</span>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
            예시 화면
          </span>
        </div>

        <div className="relative h-72 sm:h-80">
          {SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              aria-hidden={index !== activeIndex}
              style={{ transitionDuration: `${FADE_MS}ms` }}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              {slide.render()}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-line py-3.5">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`${slide.tag} 보기`}
              aria-current={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-ink-soft/70">
        실제 화면 구성 예시입니다. 수치는 데모 데이터입니다.
      </p>
    </div>
  );
}
