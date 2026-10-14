type Point = { label: string; value: number };

type LineChartProps = {
  points: readonly Point[];
  color?: string;
  className?: string;
  svgClassName?: string;
  showLabels?: boolean;
  /** 각 점 위에 값(%)을 같이 표시 */
  showValues?: boolean;
};

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 160;
const GRID_ROWS = 4;
const PAD_X = 14;
const PAD_Y = 16;
const MAX_PERCENT = 100;

function yFor(value: number): number {
  const clamped = Math.min(MAX_PERCENT, Math.max(0, value));
  return VIEW_HEIGHT - (clamped / MAX_PERCENT) * (VIEW_HEIGHT - PAD_Y * 2) - PAD_Y;
}

// 시간대별 추이 그래프. viewBox 기반이라 고정 px 아니고 컨테이너에 맞춰 늘어남.
// 값은 항상 0~100% 척도로 그림
export default function LineChart({
  points,
  color = "var(--color-primary)",
  className = "",
  svgClassName = "h-40 w-full sm:h-48",
  showLabels = true,
  showValues = false,
}: LineChartProps) {
  const step = points.length > 1 ? (VIEW_WIDTH - PAD_X * 2) / (points.length - 1) : 0;

  const coords = points.map((point, index) => ({
    x: PAD_X + index * step,
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

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className={svgClassName}
        preserveAspectRatio="none"
        role="img"
        aria-label="시간대별 시설 평균 이탈도 추이"
      >
        {Array.from({ length: GRID_ROWS }).map((_, i) => {
          const y = (VIEW_HEIGHT / (GRID_ROWS - 1)) * i;
          return <line key={i} x1="0" y1={y} x2={VIEW_WIDTH} y2={y} stroke="var(--color-line)" strokeWidth="1" />;
        })}

        <path d={areaPath} fill={color} opacity="0.12" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={i === coords.length - 1 ? 4 : 3} fill={color} />
        ))}
        {last && <circle cx={last.x} cy={last.y} r="7" fill={color} opacity="0.2" />}

        {showValues &&
          coords.map((c, i) => (
            <text key={i} x={c.x} y={Math.max(12, c.y - 10)} textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>
              {Math.round(c.value)}%
            </text>
          ))}
      </svg>

      {showLabels && (
        <div className="mt-2 flex justify-between text-[11px] font-medium text-ink-soft">
          {points.map((point, index) => (
            <span key={`${point.label}-${index}`}>{point.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
