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

/**
 * 순수 표시용 선 그래프. 데이터를 어디서 가져오는지는 모르고, 그저 points를
 * 그립니다 — SVG와 <title>만 쓰기 때문에 클라이언트 컴포넌트일 필요가 없습니다.
 *
 * 기록이 0~1개일 때도 같은 틀(축·기준선)을 그대로 보여주고, 선·점·평균선만
 * 생략합니다 — 기록이 없다고 카드 자체가 사라지지 않도록 하기 위해서입니다.
 */
export default function TrendChart({
  points,
  average,
}: {
  points: readonly TrendPoint[];
  average: number;
}) {
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

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={
          points.length > 0
            ? `최근 ${points.length}개 기록, 평균 이탈도 ${average}%`
            : "아직 표시할 기록이 없습니다"
        }
      >
        {gridPercents.map((percent) => (
          <g key={percent}>
            <line
              x1={PLOT_LEFT}
              x2={PLOT_RIGHT}
              y1={yForPercent(percent)}
              y2={yForPercent(percent)}
              className="stroke-neutral-200"
              strokeWidth={1}
            />
            <text
              x={PLOT_LEFT - 6}
              y={yForPercent(percent)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-neutral-400 text-[9px]"
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
              className="stroke-neutral-400"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />

            {/* 추이선 */}
            <path
              d={linePath}
              fill="none"
              className="stroke-neutral-300"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* 데이터 점 — 판정 색으로 표시 */}
        {points.map((point, index) => (
          <circle
            key={point.time}
            cx={xForIndex(index)}
            cy={yForPercent(point.percent)}
            r={4}
            className={`${RISK_FILL[point.risk]} stroke-white`}
            strokeWidth={2}
          >
            <title>
              {point.fullDateLabel} · {Math.round(point.percent)}%
            </title>
          </circle>
        ))}

        {points.length > 0 && (
          <>
            <text
              x={PLOT_LEFT}
              y={VIEW_HEIGHT - 6}
              textAnchor="start"
              className="fill-neutral-400 text-[9px]"
            >
              {points[0].shortDateLabel}
            </text>
            {points.length > 1 && (
              <text
                x={PLOT_RIGHT}
                y={VIEW_HEIGHT - 6}
                textAnchor="end"
                className="fill-neutral-400 text-[9px]"
              >
                {points[points.length - 1].shortDateLabel}
              </text>
            )}
          </>
        )}
      </svg>

      <ul className="mt-3 flex items-center justify-center gap-4 text-xs text-neutral-500">
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
