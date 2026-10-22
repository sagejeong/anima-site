"use client";

import { useState } from "react";

type Point = { label: string; value: number };

type LineChartProps = {
  points: readonly Point[];
  color?: string;
  className?: string;
  svgClassName?: string;
  showLabels?: boolean;
};

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 160;
const AXIS_PERCENTS = [0, 50, 75, 100] as const;
const PAD_LEFT = 28;
const PAD_RIGHT = 14;
const PAD_Y = 16;
const MAX_PERCENT = 100;

function yFor(value: number): number {
  const clamped = Math.min(MAX_PERCENT, Math.max(0, value));
  return VIEW_HEIGHT - (clamped / MAX_PERCENT) * (VIEW_HEIGHT - PAD_Y * 2) - PAD_Y;
}

// 시간대별 추이 그래프. viewBox 기반이라 고정 px 아니고 컨테이너에 맞춰 늘어남.
// 값은 항상 0~100% 척도로 그리고, 왼쪽에 0/50/75/100 축 라벨을 붙여서 점이
// 어느 구간에 있는지 바로 보이게 함. 점에 마우스를 올리면 퍼센트가 뜸
export default function LineChart({
  points,
  color = "var(--color-primary)",
  className = "",
  svgClassName = "h-40 w-full sm:h-48",
  showLabels = true,
}: LineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const step = points.length > 1 ? (VIEW_WIDTH - PAD_LEFT - PAD_RIGHT) / (points.length - 1) : 0;

  const coords = points.map((point, index) => ({
    x: PAD_LEFT + index * step,
    y: yFor(point.value),
    value: point.value,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${VIEW_HEIGHT} L${coords[0].x.toFixed(1)},${VIEW_HEIGHT} Z`
      : "";
  const last = coords[coords.length - 1];
  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className={`overflow-visible ${svgClassName}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="시간대별 시설 평균 이탈도 추이"
      >
        {/* 위험도 구간 배경: 0~50 양호 · 50~75 주의 · 75~100 경고, lib/result.ts 임계값과 동일 */}
        <rect x={PAD_LEFT} y={yFor(100)} width={VIEW_WIDTH - PAD_LEFT} height={yFor(75) - yFor(100)} fill="var(--color-critical)" opacity="0.08" />
        <rect x={PAD_LEFT} y={yFor(75)} width={VIEW_WIDTH - PAD_LEFT} height={yFor(50) - yFor(75)} fill="var(--color-caution)" opacity="0.08" />
        <rect x={PAD_LEFT} y={yFor(50)} width={VIEW_WIDTH - PAD_LEFT} height={yFor(0) - yFor(50)} fill="var(--color-good)" opacity="0.08" />

        {AXIS_PERCENTS.map((percent) => (
          <g key={percent}>
            <line
              x1={PAD_LEFT}
              x2={VIEW_WIDTH}
              y1={yFor(percent)}
              y2={yFor(percent)}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT - 6}
              y={yFor(percent)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="10"
              fill="var(--color-ink-soft)"
            >
              {percent}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={color} opacity="0.12" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={hoverIndex === i ? 6 : i === coords.length - 1 ? 4 : 3}
            fill={color}
            className="transition-[r]"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex((current) => (current === i ? null : current))}
          />
        ))}
        {last && <circle cx={last.x} cy={last.y} r="7" fill={color} opacity="0.2" />}
      </svg>

      {hovered && hoverIndex !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-steel shadow-lg"
          style={{
            left: `${(hovered.x / VIEW_WIDTH) * 100}%`,
            top: `${(hovered.y / VIEW_HEIGHT) * 100}%`,
            marginTop: "-10px",
          }}
        >
          {points[hoverIndex].label} · {Math.round(hovered.value)}%
        </div>
      )}

      {showLabels && (
        <div className="mt-2 flex justify-between pl-7 text-[11px] font-medium text-ink-soft">
          {points.map((point, index) => (
            <span key={`${point.label}-${index}`}>{point.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
