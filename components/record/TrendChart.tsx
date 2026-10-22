"use client";

import { useState } from "react";
import { RISK_COPY, type RiskLevel, type TrendPoint } from "@/lib/result";

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 160;
const PLOT_LEFT = 30;
const PLOT_RIGHT = 312;
const PLOT_TOP = 12;
const PLOT_BOTTOM = 128;
const PLOT_CENTER_X = (PLOT_LEFT + PLOT_RIGHT) / 2;

const RISK_FILL: Record<RiskLevel, string> = {
  GOOD: "fill-emerald-500",
  CAUTION: "fill-amber-500",
  RISK: "fill-red-500",
};

const RISK_DOT: Record<RiskLevel, string> = {
  GOOD: "bg-emerald-500",
  CAUTION: "bg-amber-500",
  RISK: "bg-red-500",
};

function yForPercent(percent: number): number {
  const clamped = Math.min(100, Math.max(0, percent));
  return PLOT_BOTTOM - (clamped / 100) * (PLOT_BOTTOM - PLOT_TOP);
}

// 선 그래프. 점에 마우스를 올리면 그 자리에 퍼센트를 띄워줌.
// 기록 0~1개일 때도 틀(축·기준선)은 그대로 두고 선·점·평균선만 생략함
export default function TrendChart({
  points,
  average,
}: {
  points: readonly TrendPoint[];
  average: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const hasLine = points.length >= 2;
  const xStep = hasLine ? (PLOT_RIGHT - PLOT_LEFT) / (points.length - 1) : 0;
  const xForIndex = (index: number): number =>
    points.length === 1 ? PLOT_CENTER_X : PLOT_LEFT + index * xStep;

  const linePath = hasLine
    ? points
        .map((point, index) => `${index === 0 ? "M" : "L"}${xForIndex(index)},${yForPercent(point.percent)}`)
        .join(" ")
    : "";

  const gridPercents = [0, 50, 75, 100] as const;
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={
          points.length > 0
            ? `최근 ${points.length}개 기록, 평균 이탈도 ${average}%`
            : "아직 표시할 기록이 없습니다"
        }
      >
        {/* 위험도 구간 배경: 0~50 양호 · 50~75 주의 · 75~100 경고, lib/result.ts 임계값과 동일 */}
        <rect
          x={PLOT_LEFT}
          y={yForPercent(100)}
          width={PLOT_RIGHT - PLOT_LEFT}
          height={yForPercent(75) - yForPercent(100)}
          className="fill-red-500"
          opacity="0.08"
        />
        <rect
          x={PLOT_LEFT}
          y={yForPercent(75)}
          width={PLOT_RIGHT - PLOT_LEFT}
          height={yForPercent(50) - yForPercent(75)}
          className="fill-amber-500"
          opacity="0.08"
        />
        <rect
          x={PLOT_LEFT}
          y={yForPercent(50)}
          width={PLOT_RIGHT - PLOT_LEFT}
          height={yForPercent(0) - yForPercent(50)}
          className="fill-emerald-500"
          opacity="0.08"
        />

        {gridPercents.map((percent) => (
          <g key={percent}>
            <line
              x1={PLOT_LEFT}
              x2={PLOT_RIGHT}
              y1={yForPercent(percent)}
              y2={yForPercent(percent)}
              className="stroke-line"
              strokeWidth={1}
            />
            <text
              x={PLOT_LEFT - 6}
              y={yForPercent(percent)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-ink-soft text-[9px]"
            >
              {percent}
            </text>
          </g>
        ))}

        {hasLine && (
          <>
            {/* 평균선 */}
            <line
              x1={PLOT_LEFT}
              x2={PLOT_RIGHT}
              y1={yForPercent(average)}
              y2={yForPercent(average)}
              className="stroke-ink-soft"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />

            {/* 추이선 */}
            <path
              d={linePath}
              fill="none"
              className="stroke-ink-soft"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* 데이터 점, 판정 색으로 표시. 마우스를 올리면 퍼센트가 뜸 */}
        {points.map((point, index) => (
          <circle
            key={point.time}
            cx={xForIndex(index)}
            cy={yForPercent(point.percent)}
            r={hoverIndex === index ? 6 : 4}
            className={`${RISK_FILL[point.risk]} stroke-white transition-[r]`}
            strokeWidth={2}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex((current) => (current === index ? null : current))}
          />
        ))}

        {points.length > 0 && (
          <>
            <text
              x={PLOT_LEFT}
              y={VIEW_HEIGHT - 6}
              textAnchor="start"
              className="fill-ink-soft text-[9px]"
            >
              {points[0].shortDateLabel}
            </text>
            {points.length > 1 && (
              <text
                x={PLOT_RIGHT}
                y={VIEW_HEIGHT - 6}
                textAnchor="end"
                className="fill-ink-soft text-[9px]"
              >
                {points[points.length - 1].shortDateLabel}
              </text>
            )}
          </>
        )}
      </svg>

      {hovered && hoverIndex !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-steel shadow-lg"
          style={{
            left: `${(xForIndex(hoverIndex) / VIEW_WIDTH) * 100}%`,
            top: `${(yForPercent(hovered.percent) / VIEW_HEIGHT) * 100}%`,
            marginTop: "-10px",
          }}
        >
          {hovered.fullDateLabel} · {Math.round(hovered.percent)}%
        </div>
      )}

      <ul className="mt-3 flex items-center justify-center gap-4 text-xs text-ink-soft">
        {(Object.keys(RISK_COPY) as RiskLevel[])
          .slice()
          .reverse()
          .map((level) => (
            <li key={level} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${RISK_DOT[level]}`} aria-hidden="true" />
              {RISK_COPY[level].label}
            </li>
          ))}
      </ul>
    </div>
  );
}
